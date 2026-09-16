# cord-note.github.io

The [Cord](https://github.com/cord-note/cord) landing page, served at
<https://cord-note.github.io/>.

Static HTML and CSS. No build step, no dependencies. GitHub Pages deploys the
`main` branch root folder directly, so whatever is committed here is what is
live.

## Working on it

Open `index.html` in a browser. There is nothing to install and nothing to run.

## Theme

`css/tokens.css` is copied from Cord's
`apps/desktop/src/renderer/styles/global.css`. When the app's palette changes,
re-copy the values rather than editing colours here. `css/site.css` must never
contain a literal colour.
