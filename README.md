# blog.mvaldes.dev

Bilingual (EN/ES) personal blog. Built with [Astro 6](https://astro.build), deployed to k3s via FluxCD.

## Stack

- **Astro 6** with the Content Layer API
- **JetBrains Mono** typography, custom CSS (no Tailwind, no UI lib)
- **Two content collections** (`en`, `es`) sharing a single schema; posts linked via `translationKey`
- **Per-language RSS feeds**, hreflang alternates, sitemap with i18n
- **Shiki** syntax highlighting (`github-dark-dimmed`)
- **Static build → nginx → k3s**, image automation via Flux

## Quick start

```bash
npm install
npm run dev      # local dev server on http://localhost:4321
npm run build    # output to ./dist
npm run preview  # serve the build
npm run sync     # regenerate astro:content types after schema changes
```

Node 22+ recommended.

## Project layout

```
src/
├── content/
│   ├── en/                  # English posts (.md / .mdx)
│   └── es/                  # Spanish posts (.md / .mdx)
├── content.config.ts        # collection schemas (Zod)
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
│   ├── en/
│   │   ├── index.astro
│   │   ├── posts/[...slug].astro
│   │   ├── tags/[tag].astro
│   │   └── rss.xml.ts
│   └── es/...               # mirror of en/
└── styles/
    └── global.css

k8s/        # Kubernetes manifests (Deployment, Service, IngressRoute, Kustomization, nginx.conf)
flux/       # Flux image automation (ImageRepository, ImagePolicy, ImageUpdateAutomation)
.github/workflows/build.yml   # GHA: build & push to ghcr.io
```

## Adding a post

Create a `.md` (or `.mdx`) file under `src/content/en/` or `src/content/es/`. The filename becomes the URL slug.

### Frontmatter

```yaml
---
title: "Post title"
description: "One- or two-sentence summary, used in OG tags and the post list."
pubDate: 2026-05-10
updatedDate: 2026-05-15  # optional
tags: ["kubernetes", "homelab"]
draft: false              # optional, omit or set true to hide from build
translationKey: my-key    # optional, see below
cover: /covers/foo.png    # optional, used as OG image
---

Your markdown here.
```

### Linking translations

If you write the same post in both languages, give them the same `translationKey`:

```yaml
# src/content/en/cilium-migration.md
translationKey: cilium-migration-2026

# src/content/es/migracion-cilium.md
translationKey: cilium-migration-2026
```

The post list shows an `EN · ES` pill instead of a single-language pill, each post links to its translation, and the language switcher in the header routes you to the equivalent post (not the home page).

Posts without a `translationKey` are language-only and live happily next to translated posts in the feed.

### Drafts

Set `draft: true`. The post stays in the repo, doesn't build, doesn't appear in RSS or the sitemap.

### MDX

Rename to `.mdx` to import components. Useful for embedded React-like elements, callouts, or interactive demos.

## Deployment

### Local container build

```bash
docker build -t blog-mvaldes .
docker run -p 8080:8080 blog-mvaldes
# http://localhost:8080
```

### CI/CD flow

1. Push to `main`
2. `.github/workflows/build.yml` builds the image and pushes to `ghcr.io/mvaldes14/blog-mvaldes` with tags `latest` and `sha-<short>`
3. Flux's `ImageRepository` scans ghcr.io every 5 minutes
4. `ImagePolicy` picks the newest `sha-*` tag
5. `ImageUpdateAutomation` writes the tag into `k8s/kustomization.yaml` and commits it back to git
6. Flux's Kustomization reconciles the change to the cluster

### k3s deployment

Apply the manifests in `k8s/` via your existing Flux setup. The manifests assume:

- A `web` namespace exists
- Traefik is your ingress controller (adjust `ingressroute.yaml` if you use something else)
- A cert-manager-issued wildcard TLS secret named `mvaldes-dev-wildcard-tls` exists in the `web` namespace

If the cert lives in another namespace, either copy it (kubed, reflector) or move it.

### Flux image automation

The manifests in `flux/` belong in your gitops repo, not this one. Adjust:

- `imageupdateautomation.yaml` → `spec.update.path` to point at where this repo's k8s manifests are mounted in your gitops layout
- `imagerepository.yaml` → uncomment `secretRef` if the ghcr image is private

## i18n notes

- UI strings live in `src/i18n.ts`. Add new strings to **both** `en` and `es` blocks or the type checker will complain.
- Dates use `Intl.DateTimeFormat` via the `formatDate(date, lang)` helper.
- The language switcher reads `Astro.url.pathname` and the page's `translationHref` prop. On a post page, this resolves to the equivalent post in the other language via `translationKey`. Elsewhere, it falls back to the other language's home.
- hreflang alternates only emit when a translation actually exists. No `404`s for "not yet translated" pages.

## What's missing / TODO

- [ ] About page (`/en/about`, `/es/about`)
- [ ] Talks page (`/en/talks`, `/es/talks`)
- [ ] Projects page (`/en/projects`, `/es/projects`)
- [ ] Open Graph default image at `public/og-default.png` (currently 404s)
- [ ] Search — Pagefind is easy to wire up here, runs on the static build
- [ ] Decide on Obsidian wiki-link handling if posts come from a vault later

## License

Content: all rights reserved.
Code: MIT — do what you want with the scaffold.
