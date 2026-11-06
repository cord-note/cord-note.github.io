# cord-note.github.io

The site for [Cord](https://github.com/cord-note/cord) and
[Shuttle](https://github.com/cord-note/shuttle), served at
<https://cord-note.github.io/>.

Static HTML, CSS and JavaScript. GitHub Pages deploys the `main` branch root
folder directly, so whatever is committed to `main` is live.

## Layout

- `index.html`: Cord
- `shuttle/index.html`: Shuttle
- `css/base.css`: colours, type, header, footer and buttons, shared by both
- `css/cord.css`, `css/shuttle.css`: each page's own layout
- `js/scene.js`, `js/scene-shaders.js`: the lock-screen clouds, from the app's shaders
- `js/demo.js`: runner for the animated demos
- `js/cord.js`, `js/shuttle.js`: each page's demos and behaviour
- `js/releases.js`, `js/platform.js`: download links, version and sizes from the GitHub API
- `js/editor-loader.js`: loads the live editor when it nears the screen
- `editor/`: source of the live editor bundle, built to `assets/editor/`
- `assets/shots/`: captures of the real app and editor

## Working on it

Serve the folder with any static server, for example
`python -m http.server 4173`, and open <http://localhost:4173/>.

Tests:

```bash
bun test js
```

## The live editor

The pages run the real `shuttle-editor` from npm. After bumping the version in
`editor/package.json`, rebuild and commit the result:

```bash
cd editor && npm install && npx vite build
```

## Downloads

The buttons link to the releases page and work without JavaScript.
`releases.js` then points them at the assets of the newest non-draft release, and
updates the version and file sizes.

## Where the images come from

- `assets/shots/note-*`, `palette-crop-*`, `theme-*`: captured from the real Cord
  interface on a throwaway demo vault, not from anyone's notes.
- `assets/shots/sh-*`: captured from the real `shuttle-editor` with sample documents.
- `assets/themes/*.svg`: each theme's `preview.svg` from `cord-themes`.
- `assets/og-*.png`: made from the page type and the captures above.

## When the app changes

Keep the site honest. Update `assets/shots/` when the interface changes, the
details list when what Cord does changes, and the theme count and
`assets/themes/` when `cord-themes` changes.
