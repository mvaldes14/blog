---
title: Terraform & Atlantis in homelabs
date: 2023-09-19
description: Want to look cool and deploy your infra like an enterprise would? Get some Atlantis into your homelab.
draft: true
---

In big enterprises with decent experience and infrastructure footprint you as a good engineer will use some sort of workflow to allow teams to deploy their infrastructure as code, so that things are controlled, centralized and manageable for whoever is paying the cloud bill.
So with that in mind there are a lot of companies and products that can help you keep that terraform under control (speaking of which, with the new License changes those companies are in trouble), one of the tools that I'm familiar with and enjoy using is [Atlantis](https://www.runatlantis.io/) which takes care of planning and applying as long as conditions are met.

You will ask yourself, now that sounds pretty cool, but I'm just a guy with a bunch of computers in the basement why would I care about IaC and automated workflows with fancy tools?
To which I will argue, yeah it's kind of redundant when you are the sole user of your infrastructure but one thing to remember is that us techies like to play with new toys. So in this post we are going to setup Atlantis to automate my homelab shenanigans


## How does Atlantis Work?

Good question, well it basically connects to your Github/Azure/Gitlab instance or account and listens for events on certain repositories. Once it detects a change it will kick start an execution of terraform on whatever path the project resides.
Once the plan is complete, it will update your PR with a comment giving you the details of what will be created. If everything looks gucci you can then "approve" the changes and Atlantis will apply them as planned.

## I'm sold what do I need?

Step 1.
Setup your repo for all of your infra. Mine can be seen [here](https://github.com/mvaldes14/terraform)

Step 2.
Setup your credentials within your Git Provider - aka Github for me. Once we have the token with permissions, store that somewhere safe. For more details go [here](https://www.runatlantis.io/docs/access-credentials.html#github-user)

Step 3.
Have your terraform project structure use a good state backend. Most organizations will use an S3 bucket but crazy homelab folks will most likely just use Hashicorp's Platform since they host the state for you...for free up to 500 resources.

Step 4. 
Generate a random webhook secret, this is used as to validate your requests come from the right repo/org, otherwise people can go crazy on your repo and infrastructure.

Step 5.
Initialize your project with the backend and get your login token, this is needed so Atlantis can access the remote state and actually plan and apply your manifests.

Step 6.
Deploy Atlantis !!
Atlantis needs to be running and it needs to be externally available. In my case it's in a container behind my proxy, you can check it out [here](https://atlantis.mvaldes.dev/) (don't DDO it please).

This is how my yaml looks like, minus the secrets ofc. Can be used as a base.

> One thing I've noticed while using this is that if you don't setup HCP and Atlantis to use "local" execution, the workflows get funky as HCP tried to force you to use their UI to work things.

```yaml
atlantis:
    image: ghcr.io/runatlantis/atlantis
    environment:
    - ATLANTIS_GH_USER=<your-gh-user>
    - ATLANTIS_GH_TOKEN=<your-token-from-gh>
    - ATLANTIS_REPO_ALLOWLIST=github.com/mvaldes14/terraform || <your-repo>
    - ATLANTIS_ATLANTIS_URL=https://atlantis.mvaldes.dev || <your-available-instance-dns>
    - ATLANTIS_GH_WEBHOOK_SECRET=<your-webhook-secret>
    - ATLANTIS_EMOJI_REACTION=thumbsup
    - ATLANTIS_API_SECRET=<random-secret-for-atlantis-to-validate>
    - ATLANTIS_TFE_TOKEN=<your-hcp-cloud-token>
    - ATLANTIS_TFE_LOCAL_EXECUTION_MODE=true

```

> Having a good repo structure is crucial to having a good workflow experience, otherwise you are not gonna have a good time.

With everything running now you need to configure your repo with a proper `atlantis.yml` so it knows where to go and what to read. 

Mine is setup to read from different folders that are meant to hold different "projects". Each one has it's own state and resources so everything is segmented nicely.

If you did everything right and you submit a PR you should see Atlantis replying to your PRs. I've made an example so you can check out a traditional flow - https://github.com/mvaldes14/terraform/pull/9




