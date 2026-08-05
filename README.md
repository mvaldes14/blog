# blog.mvaldes.dev

Bilingual (EN/ES) personal blog. Built with [Astro 6](https://astro.build), shipped as a static site behind nginx in a container.

## Stack

- **Astro 6** with the Content Layer API
- **JetBrains Mono** typography, custom CSS (no Tailwind, no UI lib)
- **One `posts` collection**, language selected per-post via a `lang` field
- **Per-language RSS feeds**, hreflang alternates, sitemap with i18n
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
│   └── posts/               # all posts (.md / .mdx), EN and ES together
├── content.config.ts        # collection schema (Zod)
├── i18n.ts                  # UI strings + locale helpers
├── lib/
│   └── content.ts           # getPosts, getTranslationMap helpers
├── layouts/
│   ├── Base.astro           # html lang, meta, hreflang
│   └── Post.astro           # single-post layout
├── components/
│   ├── Header.astro         # nav + language switcher
│   ├── Footer.astro
│   ├── PostCard.astro
│   └── Sidebar.astro
├── pages/
│   ├── index.astro          # redirects to /en
│   ├── talks.astro
│   ├── projects.astro
│   ├── video.astro
│   ├── en/
│   │   ├── [...page].astro  # paginated post list, 8 per page
│   │   ├── about.astro
│   │   ├── posts/[...slug].astro
│   │   ├── tags/[tag].astro
│   │   └── rss.xml.ts
│   └── es/...               # mirror of en/
└── styles/
    └── global.css

Dockerfile                    # node build → nginx runtime
nginx.conf                    # server config baked into the image
```

Cluster manifests are **not** in this repo. The blog runs on k3s, but the Deployment/Service/IngressRoute live in the gitops repo alongside everything else Flux reconciles.

## Adding a post

Drop a `.md` (or `.mdx`) file in `src/content/posts/`. The filename becomes the URL slug, and the post lands under `/en/posts/<slug>` or `/es/posts/<slug>` depending on its `lang`.

### Frontmatter

```yaml
---
lang: en                  # required — "en" or "es", decides which site section it lands in
title: Self Hosted in 2026
description: Consolidating hardware and software for the homelab
pubDate: 2026-08-04
draft: false
tags:
  - homelab
---
```

Required: `lang`, `title`, `description`, `pubDate`.
Optional: `tags` (defaults to `[]`), `draft` (defaults to `false`), `updatedDate`, `cover`, `translationKey`.

Schema lives in `src/content.config.ts` — that's the source of truth.

### Drafts

Set `draft: true`. The post stays in the repo, doesn't build, doesn't appear in the post list, RSS, or the sitemap.

### Linking translations

If you write the same post in both languages, give both files the same `translationKey`:

```yaml
# src/content/posts/cilium-migration.md
lang: en
translationKey: cilium-migration-2026

# src/content/posts/migracion-cilium.md
lang: es
translationKey: cilium-migration-2026
```

Each post then links to its translation, and the language switcher in the header routes you to the equivalent post instead of the home page. Posts without a `translationKey` are language-only and sit happily next to translated posts in the feed — which is currently every post.

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

## i18n notes

- UI strings live in `src/i18n.ts`. Add new strings to **both** `en` and `es` blocks or the type checker will complain.
- Dates use `Intl.DateTimeFormat` via the `formatDate(date, lang)` helper.
- The language switcher reads `Astro.url.pathname` and the page's `translationHref` prop. On a post page, this resolves to the equivalent post in the other language via `translationKey`. Elsewhere, it falls back to the other language's home.
- hreflang alternates only emit when a translation actually exists. No `404`s for "not yet translated" pages.

## TODO

- [ ] Open Graph default image at `public/og-default.png` (currently 404s)
- [ ] Search — Pagefind is easy to wire up here, runs on the static build
- [ ] Obsidian wiki-link handling — `task sync` copies posts verbatim, so `[[links]]` render as literal text
- [ ] Fix the `EXPOSE` / `listen` port mismatch between `Dockerfile` and `nginx.conf`

## License

Content: all rights reserved.
Code: MIT — do what you want with the scaffold.
