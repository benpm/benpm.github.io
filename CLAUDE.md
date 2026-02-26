# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio/blog site for Benjamin Mastripolito (@benpm), built with **Hugo** static site generator using the [hugo-theme-codex](https://github.com/jakewies/hugo-theme-codex) theme (git submodule). Deployed to GitHub Pages.

## Build & Development

Use native Hugo CLI for local development and production builds. Common commands:

```bash
hugo server                  # Local dev server at localhost:1313
hugo --minify                # Production build (output in /public/)
hugo new blog/my-post.md     # Scaffold new blog post
hugo new interactive/my-exp.md  # Scaffold interactive experiment
```

Hugo **extended** version is required (for SCSS compilation). The theme is a git submodule — clone with `--recurse-submodules`.

## Branch Strategy & Deployment

- **`source`** — main branch; pushes trigger GitHub Actions build+deploy
- **`master`** — generated output served by GitHub Pages (never edit directly)
- **`dev`** — development branch, merges into `source`

Deployment pipeline (`.github/workflows/gh-pages.yml`): checkout → Hugo build → publish to `master`.

## Architecture

- **`config.toml`** — Hugo site config: menu items, social links, theme params, markup settings (unsafe HTML enabled)
- **`content/`** — Markdown content: `blog/`, `professional/`, `interactive/`, `projects/`, plus standalone pages (`about.md`, `music.md`)
- **`layouts/`** — Hugo templates overriding the theme: `_default/baseof.html` (base template with GA, SEO), `index.html` (splash page), `partials/`, `shortcodes/`
- **`assets/scss/`** — SCSS: `custom.scss`, `overrides.scss` (theme overrides), `theme-toggle.scss`, `pages/` (per-page styles), `partials/`
- **`assets/js/theme_toggle.js`** — Dark/light theme toggle with localStorage persistence + typewriter animation on splash page
- **`static/`** — Unprocessed static assets (favicon, images, SVG icons)
- **`themes/hugo-theme-codex/`** — Theme submodule (customized via layout/asset overrides, not by editing the theme directly)

## Content Frontmatter

```yaml
title: "Post Title"
date: 2024-01-01T00:00:00-00:00
description: "Short description"
keywords: ["tag1", "tag2"]
draft: false
tags: ["blog"]
math: false    # Enable KaTeX math rendering
toc: false     # Enable table of contents
```

## Passing Data from Templates into JS

Use `js.Build` with `params` to pass Hugo template data into JavaScript — **never** inject via inline `<script>window.foo = ...` tags. Hugo's `js.Build` uses esbuild to resolve `@params` as a virtual module at build time.

**Template (`baseof.html`):**
```go
{{ $opts := dict "params" (dict "myKey" .Params.myValue) }}
{{ $script := resources.Get "js/myscript.js" | js.Build $opts | minify | fingerprint }}
```

**Script (`assets/js/myscript.js`):**
```js
import * as params from '@params';
// params.myKey is available here
```

Each page gets its own fingerprinted JS bundle since params differ per page — Hugo handles caching correctly.

## Custom Shortcodes

- `{{< codepen PEN_ID >}}` — Embed CodePen
- `{{< drawing "/path/img.png" "alt text" >}}` — Image with custom styling
