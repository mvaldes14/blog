---
lang: en
title: GitOps is important, even in your homelab
description: If you are not using GitOps in your homelab, sorry to tell ya but you're ngmi.
pubDate:
tags:
  - homelab
  - automation
draft: false
---
So you have a homelab, you run more than two or three services, and like a good engineer you keep the manifests in a git repository. But you still do `kubectl apply -f file.yaml` by hand? My friend, I need you to change the way you think about your homelab and treat it like a production environment.

I know what you're thinking: *why, man? I just want to run some services and enjoy my life.* Fair point, but what if you could do both and pick up a real skill for your CV along the way? Trust me bro, you want to go on this journey because you'll:

- Learn how to set up a proper cluster with replicas, high availability, and reproducibility across environments.
- Follow best practices set by the industry for security and tracking.
- Overcomplicate your life by a ton while also earning the bragging rights at family dinners once everything is properly set up. I'm sure your aunt will greatly enjoy and appreciate your GitOps.

One of these tangents I decided to do when I moved my docker swarm stack over to Kubernetes so I could learn it really well was setting up GitOps, which is the practice where you store the manifests in version control and have a control plane apply them via reconciliation once a change is detected on an interval. To the day of writing, this is one of those practices that a real production shop should be using if they are serious about running a good product. Once you reach a scale of people doing changes to an environment, having version control and the ability to roll back and do a diff on what was changed is just pure magic.

Now that we settled on why it's important, let's discuss the how. There are several options out there with their pros and cons that may entice users to pick one, but I'm a simple man so I went with the simple tool called [FluxCD](https://fluxcd.io/), which btw came out of CNCF so you know it's legit and going to be well oiled. There is also [ArgoCD](https://argo-cd.readthedocs.io/en/stable/), which is another great option, but like I said I needed something simple without a UI so I could just push manifests to a repository and watch the world burn.

With the product picked, all we needed now was to do GitOps without FluxCD, which is a chicken-and-egg type of problem if you think it through:
- You want to follow GitOps best practices, but you need the GitOps controller to get rolling.
- One solution is to have your cluster deployed with the controller baked in via terraform/cloudformation or however you provisioned your k8s cluster. This is often how enterprise works — the cluster ships with the controllers out of the box.
- In a small environment like the homelab, I simply installed FluxCD by hand and accepted that the controller itself isn't tracked in git. I know it sounds contradictory, but sometimes you have to allow yourself to keep moving instead of making things even more complex.

Once your controllers are up you can simply generate what is known as a `source`, which is basically where your manifests/images will be read from. In most cases you want a Git repository, but it is also possible to use an OCI Repo, a Helm Repository, hell even S3 Buckets. Flux has advanced so much that you can now even do [terraform](https://fluxcd.io/blog/2026/04/terraform-flux-operator-bootstrap/) manifests with it. There are a couple of other good components you can deploy and use, like an image automation controller that allows FluxCD to swap the image of a deployment for a newer one based on a search criteria like tag/regex/etc. Also a notification controller that can send messages to things like Slack, Discord, or Telegram once a manifest is updated or a new image is found. Like we said, you can go a little crazy on how many things you can do and run via GitOps.

> I have examples of source, notification, and automation controllers in my repository you can check out at https://github.com/mvaldes14/k8s-apps if you are curious. With a few exceptions, everything in my lab is deployed via FluxCD.


# How To Use It
There are a couple of workflows that I follow now.

1. Let's say a new version of `Signoz` is live and I want to upgrade. All I need to do is go to this line right here.

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  name: signoz-helm
  namespace: signoz
spec:
  targetNamespace: signoz
  timeout: 30m
  chart:
    spec:
      chart: signoz
      reconcileStrategy: ChartVersion
      sourceRef:
        kind: HelmRepository
        name: signoz-helm
      version: 0.124.0 # Update here
  interval: 1m0s
  valuesFrom:
    - kind: ConfigMap
      name: signoz-cm
```

Send a commit and wait a minute. Since this is a helm release, a helm upgrade will be executed by passing the configuration map which contains the `values.yaml` for my deployment. That folder contains other manifests for things like collectors and the MCP server, but as those are not changed the reconciliation will leave them as is.


2. There is a new tool I want to run locally, so after doing 5-10 minutes of research on how to deploy it I will do one of these:
- Write the raw `deployment|service|pvc|secret.yaml` that I will fully control, and create a flux kustomize release manifest that simply tells FluxCD to go check out this new folder in my root repository.
- If a helm chart exists that is better suited, generate the HelmRepository and HelmRelease which will do the heavy lifting for me. Most of the time we simply need to provide a custom `values.yaml` to adjust to our needs.

This is an example of how I run and deploy my [task manager application](https://blog.mvaldes.dev/en/posts/task-manager-blog/) I wrote about last time.

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: td-flux
  namespace: flux-system
spec:
  interval: 10m
  sourceRef:
    kind: GitRepository
    name: homelab-repository
  path: "./td"
  prune: true
  timeout: 1m

```

3. We briefly mentioned automations. One benefit of having everything in a single source of truth is letting things update themselves — here's an example I use often.

There are some apps like this blog you are reading that have a separate repository, so we can tell flux to simply monitor when a new container image for the blog is published in DockerHub. The combination of the image-policy and source will be enough that FluxCD will upgrade the deployment on its own by generating a new commit and forcing a reconcile.



```yaml
apiVersion: image.toolkit.fluxcd.io/v1beta2
kind: ImageRepository
metadata:
  name: blog-repository
  namespace: flux-system
spec:
  image: docker.io/rorix/blog
  interval: 5m
  provider: generic

```
The Repository tells the policy what to search for.

```yaml
apiVersion: image.toolkit.fluxcd.io/v1beta2
kind: ImagePolicy
metadata:
  name: blog-policy
  namespace: flux-system
spec:
  imageRepositoryRef:
    name: blog-repository
  digestReflectionPolicy: IfNotPresent
  policy:
    alphabetical:
      order: asc
```
The Automation tells FluxCD where to go make the change.

```yaml
apiVersion: image.toolkit.fluxcd.io/v1beta2
kind: ImageUpdateAutomation
metadata:
  name: blog-automation
  namespace: flux-system
spec:
  git:
    checkout:
      ref:
        branch: main
    commit:
      author:
        email: fluxcdbot@mvaldes.dev
        name: fluxcdbot
      messageTemplate: "{{range .Changed.Changes}}{{print .OldValue}} -> {{println .NewValue}}{{end}}"
    push:
      branch: main
  interval: 30m0s
  sourceRef:
    kind: GitRepository
    name: homelab-repository
  update:
    path: ./blog
```

Finally, the manifest will have a comment indicating where to change it.

```yaml
 containers:
      - name: blog
        image: docker.io/rorix/blog:20260512-171544@sha256:5928d6ae7a65dba11037c8a9cd017b2bf8816b15fd1f05d3918f6996517f3217 # {"$imagepolicy" : "flux-system:blog-policy"}
        imagePullPolicy:
```

# Lessons learned
All of these examples and workflows took a lot of time to setup and learn. Some things I would've benefited from knowing before doing this:
- Figure out how things are connected (source controller to match a kustomization, same for automation) — a simple naming discrepancy throws the entire thing off and debugging is a pain.
- The order of manifests is important and they rely on each other, so make sure you lay them out in the right sequence.
- Setting up observability around how FluxCD works is important, so use the metrics and notifications it provides and build alerts/dashboards around it so you know sooner when things go bad.
- Install the flux CLI to quickly see the state and suspend/resume reconciliation flows.


So go on, set up some GitOps in your lab — start [here](https://fluxcd.io/flux/get-started/). Your future self will thank you, trust me.

Until the next one, adios amigo! 👋
