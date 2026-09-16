# cord-note.github.io — org GitHub Pages site

**Date:** 2026-09-16
**Status:** Approved

## Purpose

A single-page landing site for Cord, served as the `cord-note` organisation's
GitHub Pages site at `https://cord-note.github.io/`. Cord is the org's only
shipped product, so the org site and the product site are the same page.

## Repository and hosting

The site lives in its own repository, `cord-note/cord-note.github.io`. That exact
name is what makes GitHub serve it at the organisation root rather than under a
project path. Locally it sits at `evrything-cord/cord-note.github.io/`, a sibling
of `cord/` and `shuttle/`.

Pages is configured to deploy from the `main` branch, root folder. There is no
build step and no Actions workflow: the repository contents are what gets served.
A `.nojekyll` file at the root stops GitHub running the files through Jekyll.

## File layout

```
cord-note.github.io/
  index.html          — the whole page
  css/tokens.css      — design tokens copied from Cord's global.css
  css/site.css        — layout and components, built only on those tokens
  js/releases.js      — upgrades the download links from the GitHub API
  js/theme.js         — accent-theme picker
  assets/             — screenshots and favicon
  .nojekyll
  README.md
  docs/superpowers/specs/
```

Tokens are kept in a separate stylesheet from layout so that re-syncing the
palette with the app is a whole-file copy rather than an edit hunt.

## Theme

Every colour on the page is a CSS custom property that already exists in
`cord/apps/desktop/src/renderer/styles/global.css`. No colour is invented.

The default is Cord's own default: the mono dark theme.

| Token | Value |
|---|---|
| `--bg` | `#1a1a1a` |
| `--bg-panel`, `--bg-sidebar` | `#212121` |
| `--bg-hover` | `#2a2a2a` |
| `--border` | `#2e2e2e` |
| `--text-primary` | `#e2e2e2` |
| `--text-secondary` | `#707070` |
| `--accent` | `#e2e2e2` (mono: the accent is the text colour) |
| `--radius` | `10px` |

Light scheme is served under `@media (prefers-color-scheme: light)` using the
app's real light values (`--bg #e8e8e8`, `--text-primary #1a1a1a`, and so on),
and is also reachable explicitly via `html[data-scheme="light"]` so the picker
can force it.

### Theme picker

A footer control cycles Cord's seven real accent themes — mono, blue, olive,
teal, midnight, rosewood, parchment — by setting `data-theme` on `<html>`, which
is exactly the mechanism the app uses. The token file carries all seven theme
blocks verbatim, so the site recolours the same way the app does. The choice is
remembered in `localStorage`, wrapped in try/catch, and the page renders
correctly when that read fails or returns nothing.

This exists because it demonstrates a real product feature at near-zero cost. It
is not load-bearing: with JavaScript disabled the page renders in mono dark (or
light, by system preference) and the control is hidden.

## Page sections

1. **Hero** — product name, headline, one-line pitch, download call to action,
   and the primary app screenshot.
2. **What it is** — local-first, a knowledge graph rather than a folder tree, no
   account and no cloud dependency.
3. **Features** — vaults / notes / links / tags; notepad blocks with read-only
   transclusion; Rust FTS5 search-as-you-type; the Tauri shell and Bun sidecar.
4. **Screenshots** — a strip of further app images.
5. **Install** — the per-platform file table and the unsigned-binary warning,
   carried over from the Cord README so the two cannot drift apart.
6. **Open source** — AGPL-3.0, links to the `cord` and `shuttle` repositories.
7. **Footer** — theme picker, licence, repository links.

## Screenshots

Screenshots are supplied separately by the developer. The layout does not wait
for them.

Each image sits in a frame with a fixed `aspect-ratio`, so the page's geometry is
final before any PNG exists. The named slots are `assets/hero.png`,
`assets/graph.png` and `assets/notepad.png`. Until a file is present the frame
renders as an empty panel in the app's own chrome colours, which reads as
deliberate rather than broken. Adding the real images later changes no CSS.

## Download links

The four platform buttons are written into `index.html` pointing at
`https://github.com/cord-note/cord/releases/latest`. They work with no
JavaScript at all.

`js/releases.js` then queries the public GitHub releases API on load and, if it
succeeds, rewrites each button to point directly at its platform's asset and
fills in the version string.

The unauthenticated API allows 60 requests per hour per IP address. Exceeding
that, being offline, or blocking scripts all leave the hardcoded links in place;
the only loss is the displayed version number. The script never removes or
disables a working link.

## Error handling

- No screenshot file: the aspect-ratio frame renders as an empty themed panel.
- GitHub API unavailable or rate-limited: buttons keep their static fallback
  targets; no error is shown to the visitor.
- `localStorage` unavailable or throwing: the theme falls back to mono dark and
  the system colour scheme.
- JavaScript disabled: the page is complete and every link works. Only the
  version string and the theme picker are absent.

## Verification

There is no test framework; a static page does not warrant one. Before the work
is called done:

- The page is opened in the browser pane at desktop, tablet and 375px widths,
  with no horizontal scroll at any of them.
- Both colour schemes are checked, and all seven accent themes are cycled.
- Every link is confirmed to resolve.
- The page is confirmed correct with JavaScript disabled.
- The HTML is checked for validity.

## Out of scope

Custom domain, analytics, a blog, documentation pages, a contact form, and any
build tooling. If the site later grows past one page, revisit the choice of
hand-written HTML then.
