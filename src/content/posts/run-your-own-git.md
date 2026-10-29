---
title: Run your own GitHub with Forgejo
description: Running Forgejo, Actions and a container registry in my k3s homelab because apparently trusting one Git provider was too easy.
tags:
  - coding
  - homelab
  - k8s
  - self-hosted
status: published
lang: en
pubDate: 2026-10-29
---

GitHub has had a rough time with outages lately. I could spend this post making fun of availability numbers, but those outages made me ask a more useful question: how much of my own work should depend on one provider?

Running your own Git service sounds like a lot of work. For a company with thousands of users, compliance requirements and people creating new JavaScript packages every five minutes, it probably is. For personal projects, a homelab and a second home for repositories, it is surprisingly manageable.

I previously ran Gitea and it worked pretty well, but its CI/CD runners were still early and pipelines are a big part of how I use Git. I eventually moved to [Forgejo](https://forgejo.org/), a community-driven fork with repositories, pull requests, issues, Actions, packages and a container registry in one place. GitLab can do all of this too, but it uses more resources and includes far more than I need.

Am I replacing GitHub completely? Nope. Most open-source projects still live there, and the integrations are hard to beat. Forgejo gives me control over my own projects and somewhere for my automation to run when GitHub decides it needs a day off.

## The setup

> Forgejo is only one piece of the homelab. If you want the bigger picture, I covered the rest of the stack in [Self-hosted in 2026](https://blog.mvaldes.dev/en/posts/selfhosted-2026/).

Forgejo runs in my k3s cluster, deployed by Flux from the same GitOps repository as the rest of the homelab. Yes, using GitOps to deploy a Git server has a bit of a chicken-and-egg smell to it.

For now, GitHub is still the source of truth and every repository is mirrored into Forgejo. If GitHub is unavailable, I still have a usable copy, but new changes start on GitHub. Eventually I want to reverse that flow: Forgejo becomes primary and pushes mirrors to GitHub for public access and redundancy.

The setup is small:

- One Forgejo pod
- PostgreSQL for the database, which I already run.
- A 5Gi persistent volume for repository data
- A ClusterIP service for HTTP and SSH
- TCP routing for Git over SSH
- One Forgejo Actions runner on a dedicated k3s node with Docker running. This one took a while to figure out!

The deployment uses the official container image:

```yaml
containers:
  - name: forgejo-pod
    # Replace <version> with a release you have tested.
    image: codeberg.org/forgejo/forgejo:<version>
    env:
      - name: FORGEJO__database__DB_TYPE
        value: postgres
      - name: FORGEJO__database__HOST
        value: homelab-db-rw.db.svc.cluster.local:5432
      - name: FORGEJO__database__NAME
        value: git
    ports:
      - containerPort: 3000
        name: http
      - containerPort: 22
        name: ssh
    volumeMounts:
      - name: data
        mountPath: /data
```

Forgejo reads configuration from environment variables using the `FORGEJO__section__KEY` format, then writes those values into `app.ini` when the container starts. Most of my configuration stays in the deployment instead of another giant ConfigMap I will forget exists six months from now.

Repository data lives on an NFS-backed PVC using a retained storage class:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: forgejo-data
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: nfs-k8s-keep
  resources:
    requests:
      storage: 5Gi
```

Five gigabytes is plenty for my repositories, unless I start committing Linux ISOs for some reason. Build artifacts and container images belong in package storage, not in a commit someone promises is only temporary.

## Access to it

The web interface is out there if you want to find my fabulous custom message, but I am leaving the hostname out of this post. A Cloudflare Tunnel sends the public hostname to the Forgejo service inside the cluster. That covers the website, HTTPS clones, the API and the container registry.

SSH is separate. My normal tunnel setup does not carry port 22, and to be honest I am not interested in making it do so.

SSH goes directly through Traefik on the LAN and tailnet using a separate internal hostname. Traefik has an `ssh` TCP entrypoint and an `IngressRouteTCP` forwards every connection on it to Forgejo:

```yaml
apiVersion: traefik.io/v1alpha1
kind: IngressRouteTCP
metadata:
  name: forgejo-ssh
spec:
  entryPoints:
    - ssh
  routes:
    - match: HostSNI(`*`)
      services:
        - name: forgejo-svc
          port: 22
```

SSH does not provide SNI that Traefik can use to select a hostname, so ``HostSNI(`*`)`` catches everything on this entrypoint. That entrypoint is only for Forgejo SSH. Sharing it with another TCP service would get interesting very quickly.

Forgejo also needs the correct public and SSH addresses. Without explicit server settings, the clone box happily offers `git@localhost`, which is technically a location we all love but not a useful one.

```yaml
- name: FORGEJO__server__DOMAIN
  value: forgejo.example.com
- name: FORGEJO__server__ROOT_URL
  value: https://forgejo.example.com/
- name: FORGEJO__server__SSH_DOMAIN
  value: forgejo.internal.example.com
- name: FORGEJO__server__SSH_PORT
  value: "22"
```

Using different hostnames for HTTP and SSH looks a little odd, but it keeps the web endpoint behind Cloudflare and SSH private to networks I control. I would not do this casually in a larger environment. In my case, a simple `gitconfig` saves the day.

## Running Actions without GitHub

Hosting repositories is nice, but I also need pipelines. Forgejo Actions uses a GitHub Actions-compatible workflow format, so many existing workflows need few or no changes.

The runner is another deployment in the same namespace, pinned to one machine for a reason.

```yaml
runner:
  capacity: 2
  timeout: 1h
  labels:
    - docker:docker://catthehacker/ubuntu:act-latest
    - ubuntu-latest:docker://catthehacker/ubuntu:act-latest
container:
  network: bridge
  privileged: false
  docker_host: automount
  force_pull: true
```

The runner needs a Docker engine, so the pod mounts `/var/run/docker.sock` from the node. Builds stay fast and Buildx can reuse layers between runs.

I could run another Docker engine inside the cluster, but that level of abstraction made my head hurt. One machine already runs Docker for a VPN workload I never migrated into k3s, so I pinned the runner there. It is also beefy enough to handle multiple jobs, although I currently cap it at two.

> I only run my own trusted repositories on this runner. Access to a rootful Docker socket gives jobs effective root access to the node, even with `privileged: false`. I would not expose this runner to arbitrary public pull requests unless I wanted strangers to become creative administrators of my fleet.

## Container registry

The built-in package registry was a nice surprise. I have used Docker Hub for years and, more recently, the GitHub Container Registry without problems. Still, I have spare compute and apparently not enough services to maintain, so hosting my own images was bound to happen.

I am still testing this part. The goal is to build images in Forgejo and eventually have k3s pull them for deployments. The job uses the same actions many GitHub workflows already use:

```yaml
jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3
        with:
          driver: docker

      - uses: docker/login-action@v3
        if: github.event_name != 'pull_request'
        with:
          registry: forgejo.example.com
          username: ${{ github.repository_owner }}
          password: ${{ secrets.REGISTRY_TOKEN }}

      - uses: docker/build-push-action@v6
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          provenance: false
          tags: forgejo.example.com/owner/my-app:latest
```

`REGISTRY_TOKEN` is a Forgejo personal access token with `write:package` permission. Pull-request jobs still build the image, but they skip the registry login and push.

"GitHub compatible" still came with a few surprises:

- GitHub Actions cache storage does not magically exist on a self-hosted Forgejo runner. Using `cache-to: type=gha` failed because there was no cache service behind it.
- Build attestations could hang while pushing manifests, so these workflows use `provenance: false`.
- The Docker driver keeps layer caching on the node itself and works better for this small setup than pretending I have a full remote build-cache platform.

This works, but it is not the invisible GitHub-hosted experience. The runner is mine now, including whatever weird state it gets itself into. Congratulations and condolences, I guess.

## Is it worth running?

For me, yes.

Forgejo gives me private repositories, pull requests, issues, Actions and a container registry without becoming a huge deployment. It also fits what already runs in the homelab: Flux deploys it, Kubernetes Secrets hold its credentials, Traefik handles SSH and Cloudflare exposes the web interface.

I still have to upgrade it, watch storage, keep PostgreSQL alive and occasionally find out why a runner job left an orphan Docker container behind. The setup is small enough for me to understand and boring enough that I do not think about it every day.

You probably should not move an entire company away from GitHub because it had a bad week. You may still want a second home for personal repositories and automation. Running Forgejo makes that much less ridiculous than it sounds.

If this sounds useful, start with one repository and skip the runner at first. Get cloning, pushing and mirroring working. Add Actions later, after deciding how much access repository code should have to one of your machines.

Adios!