# cord-note.github.io — remake

**Date:** 2026-09-30
**Status:** Approved, implemented
**Supersedes:** `2026-09-16-org-pages-site-design.md`

## Purpose

Rebuild the org site from scratch: new look, new content, two products. The old
site was a generic dark landing page tied to the app's mono theme, and its copy
predates the Shuttle cutover, the v2.0 beta, the PIN lock screen and native Linux
packages.

## Hosting and build

Unchanged: repository `cord-note/cord-note.github.io`, Pages deploys `main` from
the root, no build step, no Actions workflow, `.nojekyll` at the root. Plain HTML,
CSS and a little JavaScript.

## File layout

```
index.html              — Cord
shuttle/index.html      — Shuttle
css/tokens.css          — both themes' tokens, nothing else
css/site.css            — layout and components, built only on tokens
js/releases.js          — download links from the GitHub releases API
js/releases.test.js     — bun test for platformFor
js/theme.js             — theme toggle
assets/                 — screenshots, logo, favicon, motif SVGs
```

The old `js/theme.js` accent picker and the app-copied `tokens.css` are
removed. The header and footer are duplicated in the two pages; that is
accepted at two pages.

## Two themes, two characters

The themes are not one design with the colours inverted. They share the layout
grid, the content and the type families, but each has its own treatment.

### Paper (light) — editorial

- Warm off-white paper (about `#f4f0e8`), ink-black text (about `#1c1a17`),
  oxblood accent (about `#7a2630`).
- Serif display headlines (Newsreader, Google Fonts), a humanist
  sans for body text, mono for code and file names.
- Hairline rules instead of boxed cards. Margin annotations beside the text,
  set small and italic, like marginalia.
- Signature motif: loose, hand-drawn-looking nodes and links in the margins
  (SVG), which draw themselves in on scroll — an echo of wiki links.
- Screenshots sit on the paper with a soft shadow, like prints laid on a page.

### Charcoal (dark) — precision

- Charcoal ground (about `#17181a`) with a slightly lighter panel tone, off-white
  text (about `#e6e3dc`), and a single warm signal accent (vermilion, about
  `#e0664a`) used sparingly.
- Same serif for headlines but set tighter and lighter-weight; mono takes over
  labels, eyebrows and annotations (uppercase, tracked), so the page reads like
  a technical drawing rather than a notebook.
- A faint measurement grid in the background, crop marks at section corners,
  and numbered section labels (`01 — Local first`).
- The motif becomes precise: straight links, small square nodes, coordinates
  and tick marks instead of hand-drawn strokes. Same positions, same draw-in.
- Screenshots get a hairline frame with corner marks instead of a shadow.

Every difference is expressed through tokens plus a small number of
theme-scoped rules (`:root[data-theme="dark"] …`). No element exists in only one
theme; each theme restyles the same markup.

### Choosing the theme

- Default follows `prefers-color-scheme`.
- A toggle in the header switches paper / charcoal by setting `data-theme` on
  `<html>`. The choice is saved to `localStorage` inside try/catch; the page
  renders correctly when storage is unavailable.
- An inline script in `<head>` applies the saved theme before first paint so
  there is no flash.
- With JavaScript off, the system preference applies and the toggle is hidden.

## Pages

### `/` — Cord

1. **Hero** — headline, one-line pitch, a download button for the visitor's OS
   (all platforms listed below it), hero screenshot. Tag: v2.0 beta.
2. **Local first** — every note is a row in SQLite on your own machine; no
   account, no sync service, no telemetry. Local accounts with a PIN lock screen.
   The copy does not call the PIN encryption.
3. **A graph, not a filing cabinet** — `[[wiki links]]`, backlinks from both
   ends, vaults and tags.
4. **Notepads and blocks** — addressable blocks, per-block tags and links,
   read-only transclusion by reference.
5. **Search as you type** — full-text search in Rust against SQLite FTS5.
6. **Screenshot spread** — transclusion, blocks, palette.
7. **Install** — Windows `.exe`, macOS Apple Silicon `.dmg`, Linux `.deb`,
   `.rpm` and AppImage. `.rpm` shows "Coming with 2.0" until a release carries
   one, then `releases.js` turns it into a button. The unsigned-binary notes
   (SmartScreen, Gatekeeper, `chmod +x`) are kept.
8. **Built on Shuttle** — short teaser linking to `/shuttle/`.
9. **Open source** — AGPL-3.0, links to both repositories.

### `/shuttle/` — Shuttle

1. **Hero** — a React rich-text editor for note-taking apps, built on official
   Tiptap 3. Links to npm (`shuttle-editor`) and GitHub.
2. **Features** — from the Shuttle README: ghost markdown, wiki links and
   unlinked mentions, notepad mode, block transclusion, math, tables, find &
   replace, outline, image uploads, embeds, slash menu, rebindable shortcuts.
3. **Install** — npm / pnpm / yarn commands, peer dependencies, and the GitHub
   Packages alternative (`@cord-note/shuttle`).
4. **Quick start** — the README's snippet.
5. **`ShuttleHost`** — what the adapter is: your app plugs in note search, file
   storage and navigation through one object.
6. **Licence** — AGPL-3.0-or-later.

Content on this page is taken from the Shuttle README so the two agree.

### Shared

Slim header: Cord, Shuttle, GitHub, theme toggle. Footer: licence and links.

## Download links

Every button is written into the HTML pointing at
`https://github.com/cord-note/cord/releases` and works without JavaScript.
`releases.js` takes the newest non-draft release from the public releases API
(`/releases/latest` skips pre-releases, so it would offer v1.7 while 2.0 is in
beta) and, on success,
rewrites each button to its asset and fills in the version. `platformFor` gains
`.rpm`. Any failure (offline, rate limit, blocked script) leaves the static links
alone.

The hero button picks the visitor's OS from `navigator.userAgentData` or the user
agent string, falling back to "Download" linking to `#install`.

## Motion and accessibility

- The draw-in animation is disabled under `prefers-reduced-motion`, which shows
  the motif fully drawn.
- Motif SVGs are decorative (`aria-hidden`).
- Both themes meet WCAG AA contrast for body text and the accent on buttons.
- The layout works at phone width with a 16px gutter and no horizontal scroll;
  margin annotations fold inline below the text on narrow screens.

## Testing

- `bun test js/releases.test.js` covers `platformFor` (every asset type,
  including `.sig` and updater files returning null).
- Both pages are checked in the browser at phone and desktop width, in both
  themes, with and without JavaScript.

## Out of scope

Docs, changelog, blog, and any build tooling.
