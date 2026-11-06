---
lang: en
title: How I centralized GitHub Actions across my repositories
description: How I stopped copying CI workflows between repositories and centralized reusable GitHub Actions in one place.
pubDate: 2026-11-03
status: published
tags:
  - coding
  - ci-cd
  - github
---
I maintain "enough" repositories that copying the same GitHub Actions workflows into each one became a real PITA. Most are created and managed as code, with their configuration baked in from the start. That includes container secrets, registry settings, service API keys, tests, and linting. Every improvement meant changing the same YAML again and again.

This reminded me of a pattern from my enterprise days. Teams kept shared CI/CD workflows in a handful of repositories and consumed them as internal services. I am my own tiny cloud and company, so I borrowed the idea and created [mvaldes14/gh-actions](https://github.com/mvaldes14/gh-actions).

This post focuses on reusable workflows: complete jobs that another workflow calls at the job level. The central repository keeps them under `.github/workflows/`. Each application repository only needs a small caller workflow to define when CI runs, grant the required permissions, and call the shared workflow.

A Go repository can add separate test and lint jobs with this complete caller workflow:

```yaml
name: Go CI

on:
  push:
    branches:
      - main
  pull_request:

jobs:
  go:
    permissions:
      contents: read
    uses: mvaldes14/gh-actions/.github/workflows/go-ci.yml@main
```

The caller controls the events. The reusable workflow creates separate `test` and `lint` jobs, so they appear as distinct checks and a lint failure does not hide a test failure.

The shared workflow handles runner selection and job steps. Its `workflow_call` configuration exposes inputs for the Go version, working directory, test arguments, lint settings, and other options. Most repositories use the defaults. Unusual projects can override them without copying the workflow.

Container builds use the same pattern. This caller builds the image on pull requests and pushes it from the default branch or a version tag:

```yaml
name: Container

on:
  push:
    branches:
      - main
    tags:
      - "v*"
  pull_request:

jobs:
  image:
    permissions:
      contents: read
      packages: write
    uses: mvaldes14/gh-actions/.github/workflows/docker-build-push.yml@main
    with:
      image: mvaldes14/myapp
```

The shared workflow disables pushing when the event is `pull_request`, but still runs the build so failures show up before merge.

Permissions stay in the caller. A reusable workflow can narrow the `GITHUB_TOKEN` permissions it receives, but it cannot grant itself more access.

## What lives in the shared repository

The workflows cover the CI jobs I repeat across projects:

- Test and lint Go projects as separate checks
- Check Lua projects with StyLua and LuaCheck
- Build container images on pull requests, then push them from branch and tag events for GitOps to apply
- Discover Dockerfiles in monorepos and generate build matrices automatically
- Run PR-Agent for pull request summaries and reviews

Each application repository now contains only its triggers, permissions, inputs, and project-specific configuration. Everything else is shared and maintained as a unit.

## What stays in each repository

Centralizing workflow code does not mean centralizing credentials. In my setup, secrets stay in the repository that executes the workflow. If your repositories belong to a GitHub organization, organization-level secrets may be a better fit, so this part may look different for you.

The caller passes only the secrets required for its job. For example, this complete PR-Agent caller keeps the `BEDROCK_API_KEY` in the application repository:

```yaml
name: PR Agent

on:
  pull_request_target:
    types:
      - opened
      - reopened
      - ready_for_review
      - synchronize
      - review_requested
  issue_comment:
    types:
      - created

jobs:
  pr-agent:
    permissions:
      contents: read
      issues: write
      pull-requests: write
    uses: mvaldes14/gh-actions/.github/workflows/pr-agent.yml@main
    secrets:
      BEDROCK_API_KEY: ${{ secrets.BEDROCK_API_KEY }}
```

`pull_request_target` runs in the context of the base repository and can access its secrets. That makes checking out or executing code from the pull request dangerous. This shared workflow does neither: PR-Agent reads the pull request through the GitHub API.

The central repository defines the secret contract through `workflow_call`, but never stores the key. The same rule applies to registry credentials and any other secret a workflow needs. Shared code lives in one repository. Access stays with the repository that owns the job.

## Pros and cons

**Good:** I pin third-party actions to commit SHAs, and Dependabot/Renovatebot opens updates for those pins. Fixing a shared workflow no longer means hunting through every repository I own.

**Bad:** There is a cost. A bad change in the central repository has a larger blast radius. I keep inputs explicit, avoid hiding too much behavior, and test changes before more repositories depend on them.

**Hot Take:** None of this is clever. It mostly deletes duplicated YAML, which is some of my least favorite YAML.

If you maintain several repositories with similar pipelines, start with the workflow you are most tired of copying. You will see the benefit quickly.

Adios.
