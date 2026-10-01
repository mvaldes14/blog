# blog.mvaldes.dev

English personal blog. Built with [Astro 6](https://astro.build), shipped as a static site behind nginx in a container.

## Stack

- **Astro 6** with the Content Layer API
- **JetBrains Mono** typography, custom CSS (no Tailwind, no UI lib)
- **One `posts` collection**, currently publishing English posts
- **Single English RSS feed**
- **Shiki** syntax highlighting (`github-dark-dimmed`)
- **Static build → nginx → container image**

## Quick start

```bash
npm install
npm run dev      # local dev server on http://localhost:4321
npm run build    # output to ./dist
npm run preview  # serve the build
npm run sync     # regenerate astro:content types after schema changes
```

Node 22 (see `.node-version`). `devbox` + `direnv` are wired up: `cd` into the repo and `npm install` runs automatically.

There's also a `Taskfile.yaml`:

```bash
task dev      # npm run dev
task build    # npm run build
task clean    # rm -rf dist
task sync     # rsync posts in from the Obsidian vault
task publish  # git add . && commit "docs: update blog content <date>" && push
```

## Project layout

```
src/
├── content/
│   └── posts/               # all posts (.md / .mdx)
├── content.config.ts        # collection schema (Zod)
├── i18n.ts                  # UI strings + date helpers
├── lib/
│   └── content.ts           # post helpers
├── layouts/
│   ├── Base.astro           # html lang + meta
│   └── Post.astro           # single-post layout
├── components/
│   ├── Header.astro         # nav
│   ├── Footer.astro
│   ├── PostCard.astro
│   └── Sidebar.astro
├── pages/
│   ├── index.astro          # redirects to /en
│   ├── projects.astro
│   ├── video.astro
│   ├── en/
│   │   ├── [...page].astro  # paginated post list, 8 per page
│   │   ├── about.astro
│   │   ├── posts/[...slug].astro
│   │   ├── tags/[tag].astro
│   │   └── rss.xml.ts
└── styles/
    └── global.css

Dockerfile                    # node build → nginx runtime
nginx.conf                    # server config baked into the image
```

Cluster manifests are **not** in this repo. The blog runs on k3s, but the Deployment/Service/IngressRoute live in the gitops repo alongside everything else Flux reconciles.

## Adding a post

Drop a `.md` (or `.mdx`) file in `src/content/posts/`. The filename becomes the URL slug, and published English posts land under `/en/posts/<slug>`.

### Frontmatter

```yaml
---
lang: en                  # required — currently only "en" publishes
title: Self Hosted in 2026
description: Consolidating hardware and software for the homelab
pubDate: 2026-08-04
status: published
tags:
  - homelab
---
```

Required: `lang`, `title`, `description`, `pubDate`.
Optional: `tags` (defaults to `[]`), `status` (defaults to `published`; use `draft` for drafts), `updatedDate`, `cover`.

Schema lives in `src/content.config.ts` — that's the source of truth.

### Drafts

Set `status: draft`. Published posts use `status: published` or omit `status` entirely. Draft posts stay in the repo, don't build, don't appear in the post list, RSS, or the sitemap.

Spanish content can still live in the collection with `lang: es`, but it is not routed or published right now.

### MDX

Rename to `.mdx` to import components. Useful for callouts or interactive demos.

## Writing flow

Posts are drafted in Obsidian (`~/Obsidian/wiki/Blog/`, or the WSL path on Windows) and rsync'd into `src/content/posts/` with `task sync`. Frontmatter in the vault must already carry `lang` — sync doesn't add it. Then `task publish` commits and pushes, which triggers the build.

## Deployment

### Local container build

```bash
docker build -t blog-mvaldes .
docker run -p 8080:80 blog-mvaldes
# http://localhost:8080
```

nginx listens on port 80 inside the container (the `EXPOSE 8080` line in the Dockerfile is stale and doesn't match `nginx.conf`).

Pushes are built into a tagged image by CI and rolled out to k3s by Flux from a separate gitops repo.

## Locale notes

- UI strings live in `src/i18n.ts`.
- Dates use `Intl.DateTimeFormat` via the `formatDate(date, lang)` helper.

## TODO

- [ ] Open Graph default image at `public/og-default.png` (currently 404s)
- [ ] Search — Pagefind is easy to wire up here, runs on the static build
- [ ] Obsidian wiki-link handling — `task sync` copies posts verbatim, so `[[links]]` render as literal text
- [ ] Fix the `EXPOSE` / `listen` port mismatch between `Dockerfile` and `nginx.conf`

## License

Content: all rights reserved.
Code: MIT — do what you want with the scaffold.
