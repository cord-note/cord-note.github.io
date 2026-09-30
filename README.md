# cord-note.github.io

The site for [Cord](https://github.com/cord-note/cord) and
[Shuttle](https://github.com/cord-note/shuttle), served at
<https://cord-note.github.io/>.

Static HTML, CSS and a little JavaScript. No build step. GitHub Pages deploys
the `main` branch root folder directly, so whatever is committed here is live.

## Layout

```
index.html            Cord
shuttle/index.html    Shuttle
css/tokens.css        both themes, as tokens
css/site.css          layout and components (no colours, no theme selectors)
js/platform.js        pure helpers: asset → platform, visitor OS, which release
js/releases.js        download links and version from the GitHub API
js/theme.js           Paper / Charcoal toggle
js/motif.js           draws the margin graphs in on scroll
```

## Themes

Two themes with different characters, not one inverted:

- **Paper** (light): warm stock, ink, oxblood, hand-drawn links, italic
  marginalia.
- **Charcoal** (dark): a measurement grid, numbered sections, crop marks,
  uppercase mono labels, straight links.

Every difference, structural ones included, is a token in `css/tokens.css`.
The dark block is written twice there (system preference, and an explicit
choice), and nowhere else. Each motif SVG carries a `.hand` and a `.precise`
drawing; the tokens decide which shows.

## Downloads

The buttons link to the releases page and work without JavaScript.
`releases.js` then points them at the assets of the newest non-draft release.
It does not use `/releases/latest`, which skips pre-releases and would offer
the previous version while Cord is in beta.

## Working on it

Serve the folder with any static server, for example
`python -m http.server 4173`, and open <http://localhost:4173/>.

Tests: `bun test js`.
