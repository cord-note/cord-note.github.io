# cord-note.github.io Org Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page landing site for Cord, served as the `cord-note` organisation's GitHub Pages site at `https://cord-note.github.io/`.

**Architecture:** Hand-written static HTML and CSS with no build step and no dependencies. GitHub Pages serves the repository root directly. All colour comes from design tokens copied out of Cord's own `global.css`, so the site and the app cannot drift apart visually. Two small scripts progressively enhance a page that is already complete without them.

**Tech Stack:** HTML5, CSS custom properties, vanilla ES2020. No framework, no bundler, no package manager.

**Spec:** `docs/superpowers/specs/2026-09-16-org-pages-site-design.md`

---

## Deviation from the spec

The spec said the light scheme would also be reachable explicitly through
`html[data-scheme="light"]` "so the picker can force it". It cannot and does not
need to: the picker cycles *accent themes* only, and the light/dark scheme
follows `prefers-color-scheme`. Supporting both would mean writing every light
token block twice. This plan therefore emits each light block once, inside a
single `@media (prefers-color-scheme: light)` rule. Nothing else changes.

---

## File Structure

| File | Responsibility |
|---|---|
| `index.html` | The entire page. Content and structure only. |
| `css/tokens.css` | Colour, radius and font tokens copied from the app. No layout rules. |
| `css/site.css` | Layout, typography and components. Reads tokens, never hardcodes a colour. |
| `js/releases.js` | Upgrades the four download links using the GitHub releases API. |
| `js/theme.js` | Accent-theme picker. Sets `data-theme` on `<html>`, persists to `localStorage`. |
| `assets/` | Screenshots and favicon. |
| `.nojekyll` | Stops GitHub running the repo through Jekyll. |
| `README.md` | What the repo is and how it deploys. |

The split between `tokens.css` and `site.css` is the important one: re-syncing
the palette with the app touches one file and reads as a diff of values, not a
diff of design.

---

## A note on testing

There is no test runner and no dependency on one, because adding either would
contradict the "no build tooling" decision in the spec for a page with no build
step. Verification is therefore explicit per task: a `grep` assertion where the
check is textual, and a browser-pane check where the check is visual. Task 12 is
a full verification sweep against the spec's checklist.

`js/releases.js` contains the only real logic on the page — matching a release
asset filename to a platform. Task 9 verifies it with console assertions run
against the live page, which needs no tooling and tests the function that
actually ships.

---

### Task 1: Repository scaffolding

**Files:**
- Create: `.nojekyll`
- Create: `.gitattributes`
- Create: `README.md`

- [ ] **Step 1: Create `.nojekyll`**

It must exist and be empty. Without it GitHub runs the site through Jekyll,
which silently ignores any file or directory whose name starts with an
underscore.

```bash
touch .nojekyll
```

- [ ] **Step 2: Create `.gitattributes`**

The repo is authored on Windows and served by Linux. Pin line endings so the
served files are not CRLF.

```
* text=auto eol=lf
```

- [ ] **Step 3: Create `README.md`**

```markdown
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
```

- [ ] **Step 4: Verify**

Run: `ls -a`
Expected: `.nojekyll`, `.gitattributes` and `README.md` all present.

Run: `test ! -s .nojekyll && echo empty`
Expected: `empty`

- [ ] **Step 5: Commit**

```bash
git add .nojekyll .gitattributes README.md
git commit -m "chore: scaffold Pages repository"
```

---

### Task 2: Design tokens

**Files:**
- Create: `css/tokens.css`
- Source of truth: `../cord/apps/desktop/src/renderer/styles/global.css`

Only the tokens the site actually uses are carried over. The app's layout tokens
(`--sidebar-width`, `--note-list-width`) and its syntax-highlighting tokens are
left behind; the site has no sidebar and no code blocks.

- [ ] **Step 1: Write `css/tokens.css`**

```css
/* Tokens copied from Cord's renderer global.css. Do not invent colours here:
   change them in the app first, then re-copy. Dark mono is the default, exactly
   as it is in the app. */

:root {
  --bg:          #1a1a1a;
  --bg-sidebar:  #212121;
  --bg-panel:    #212121;
  --bg-hover:    #2a2a2a;
  --bg-active:   #333333;
  --bg-input:    #252525;
  --bg-elevated: #2a2a2a;

  --border:        #2e2e2e;
  --border-strong: #404040;
  --border-muted:  #2a2a2a;

  --text-primary:   #e2e2e2;
  --text-secondary: #707070;
  --text-muted:     #505050;

  --accent:       #e2e2e2;
  --accent-hover: #cccccc;
  --accent-fg:    #1a1a1a;

  --link-color:     #8a8a8a;
  --link-underline: rgba(138, 138, 138, 0.3);

  --radius:    10px;
  --radius-sm: 6px;
  --radius-lg: 14px;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  --font-ui:   -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

html[data-theme="blue"] {
  --accent: #4a8ff5; --accent-hover: #3a7ce0; --accent-fg: #ffffff;
  --bg: #11151c; --bg-sidebar: #151b25; --bg-panel: #19212e;
  --bg-hover: #212d40; --bg-active: #2c374b; --bg-input: #273246;
  --bg-elevated: #313c51;
  --border: #212d40; --border-strong: #364156;
  --link-color: #7aabf5; --link-underline: rgba(122, 171, 245, 0.3);
}

html[data-theme="olive"] {
  --accent: #c9a84c; --accent-hover: #b8963e; --accent-fg: #1b1e14;
  --bg: #1b1e14; --bg-sidebar: #1f2318; --bg-panel: #232717;
  --bg-hover: #2b3020; --bg-active: #35402a; --bg-input: #262b1a;
  --bg-elevated: #303520;
  --border: #2b3020; --border-strong: #3d4530;
  --link-color: #c9a84c; --link-underline: rgba(201, 168, 76, 0.3);
}

html[data-theme="teal"] {
  --accent: #e07a54; --accent-hover: #cc6840; --accent-fg: #ffffff;
  --bg: #0e2323; --bg-sidebar: #122929; --bg-panel: #163030;
  --bg-hover: #1d3c3c; --bg-active: #264848; --bg-input: #1a3636;
  --bg-elevated: #203838;
  --border: #1d3c3c; --border-strong: #2e5050;
  --link-color: #e07a54; --link-underline: rgba(224, 122, 84, 0.3);
}

html[data-theme="midnight"] {
  --accent: #f7768e; --accent-hover: #e05070; --accent-fg: #ffffff;
  --bg: #16161e; --bg-sidebar: #1a1b26; --bg-panel: #1e1f2e;
  --bg-hover: #252636; --bg-active: #2f3148; --bg-input: #222336;
  --bg-elevated: #2a2c40;
  --border: #252636; --border-strong: #363855;
  --link-color: #bb9af7; --link-underline: rgba(187, 154, 247, 0.3);
}

html[data-theme="rosewood"] {
  --accent: #d4856b; --accent-hover: #c06e56; --accent-fg: #ffffff;
  --bg: #221818; --bg-sidebar: #281e1e; --bg-panel: #2c2222;
  --bg-hover: #362828; --bg-active: #423232; --bg-input: #302424;
  --bg-elevated: #3a2e2e;
  --border: #362828; --border-strong: #4a3838;
  --link-color: #d4856b; --link-underline: rgba(212, 133, 107, 0.3);
}

html[data-theme="parchment"] {
  --accent: #d4a572; --accent-hover: #c08e5a; --accent-fg: #1e1a14;
  --bg: #1e1a14; --bg-sidebar: #241f18; --bg-panel: #28231c;
  --bg-hover: #322c24; --bg-active: #3e362c; --bg-input: #2c2620;
  --bg-elevated: #363028;
  --border: #322c24; --border-strong: #464030;
  --link-color: #d4a572; --link-underline: rgba(212, 165, 114, 0.3);
}

@media (prefers-color-scheme: light) {
  :root {
    --bg: #e8e8e8; --bg-sidebar: #dedede; --bg-panel: #dedede;
    --bg-hover: #d4d4d4; --bg-active: #c8c8c8; --bg-input: #d9d9d9;
    --bg-elevated: #e2e2e2;
    --border: #c6c6c6; --border-strong: #ababab; --border-muted: #d2d2d2;
    --text-primary: #1a1a1a; --text-secondary: #4f4f4f; --text-muted: #7d7d7d;
    --accent: #1a1a1a; --accent-hover: #333333; --accent-fg: #e8e8e8;
    --link-color: #666666; --link-underline: rgba(100, 100, 100, 0.3);
  }

  html[data-theme="blue"] {
    --accent: #2563eb; --accent-hover: #1d4ed8; --accent-fg: #ffffff;
    --bg: #dde5f4; --bg-sidebar: #d0dcf0; --bg-panel: #d0dcf0;
    --bg-hover: #c3d2e9; --bg-active: #b4c7e2; --bg-input: #ccd9ee;
    --bg-elevated: #d7e1f2;
    --border: #b0c2df; --border-strong: #90aacf; --border-muted: #c2d0e8;
    --text-primary: #0f1f3d; --text-secondary: #33486a; --text-muted: #6a83a3;
    --link-color: #1d4ed8; --link-underline: rgba(29, 78, 216, 0.3);
  }

  html[data-theme="olive"] {
    --accent: #7a5c1e; --accent-hover: #6a4e18; --accent-fg: #f5f0e8;
    --bg: #e9e2cd; --bg-sidebar: #e0d8c0; --bg-panel: #e0d8c0;
    --bg-hover: #d5ccb0; --bg-active: #c9bf9f; --bg-input: #dcd3ba;
    --bg-elevated: #e4ddc6;
    --border: #c4bb9e; --border-strong: #aca386; --border-muted: #d3caae;
    --text-primary: #2a2510; --text-secondary: #52492b; --text-muted: #857b5c;
    --link-color: #7a5c1e; --link-underline: rgba(122, 92, 30, 0.3);
  }

  html[data-theme="teal"] {
    --accent: #c05a38; --accent-hover: #a84828; --accent-fg: #ffffff;
    --bg: #d6e9e9; --bg-sidebar: #c7e0e0; --bg-panel: #c7e0e0;
    --bg-hover: #b8d8d8; --bg-active: #a8cfcf; --bg-input: #bfdcdc;
    --bg-elevated: #cde4e4;
    --border: #a6cccc; --border-strong: #8bbcbc; --border-muted: #b9d6d6;
    --text-primary: #0a2020; --text-secondary: #244646; --text-muted: #5c8888;
    --link-color: #c05a38; --link-underline: rgba(192, 90, 56, 0.3);
  }

  html[data-theme="midnight"] {
    --accent: #d93060; --accent-hover: #c02050; --accent-fg: #ffffff;
    --bg: #e4e4f0; --bg-sidebar: #d9d9ea; --bg-panel: #d9d9ea;
    --bg-hover: #cbcbe1; --bg-active: #bcbcd6; --bg-input: #d2d2e5;
    --bg-elevated: #dedeec;
    --border: #b8b8d4; --border-strong: #9e9ec2; --border-muted: #c9c9de;
    --text-primary: #0f0f20; --text-secondary: #343457; --text-muted: #71719b;
    --link-color: #7c4dff; --link-underline: rgba(124, 77, 255, 0.3);
  }

  html[data-theme="rosewood"] {
    --accent: #a05040; --accent-hover: #884030; --accent-fg: #ffffff;
    --bg: #ebdcd8; --bg-sidebar: #e0cdc7; --bg-panel: #e0cdc7;
    --bg-hover: #d4bdb6; --bg-active: #c7aca4; --bg-input: #dbc5be;
    --bg-elevated: #e5d4ce;
    --border: #c6aca6; --border-strong: #b0958c; --border-muted: #d5bdb7;
    --text-primary: #2a1010; --text-secondary: #573939; --text-muted: #8f6a6a;
    --link-color: #a05040; --link-underline: rgba(160, 80, 64, 0.3);
  }

  html[data-theme="parchment"] {
    --accent: #7c5835; --accent-hover: #6a4828; --accent-fg: #e9e0ce;
    --bg: #e9e0ce; --bg-sidebar: #ded4bf; --bg-panel: #ded4bf;
    --bg-hover: #d3c8ae; --bg-active: #c6b99c; --bg-input: #d9cfb6;
    --bg-elevated: #e3d9c3;
    --border: #c3b79c; --border-strong: #ab9d80; --border-muted: #d2c7ad;
    --text-primary: #2a2018; --text-secondary: #5c4c36; --text-muted: #8d7c5f;
    --link-color: #7c5835; --link-underline: rgba(124, 88, 53, 0.3);
  }
}
```

- [ ] **Step 2: Verify every theme is present**

Run: `grep -c 'data-theme=' css/tokens.css`
Expected: `12` — six accent themes, each defined once dark and once light.

- [ ] **Step 3: Verify the light overrides sit inside the media query**

Run: `awk '/prefers-color-scheme: light/{f=1} f && /--text-primary: #1a1a1a/{print "ok"; exit}' css/tokens.css`
Expected: `ok`

- [ ] **Step 4: Commit**

```bash
git add css/tokens.css
git commit -m "feat: add design tokens copied from Cord's app theme"
```

---

### Task 3: Page shell and base stylesheet

**Files:**
- Create: `index.html`
- Create: `css/site.css`

This task produces a page that renders correctly but has no content sections
yet. Sections are added one per task afterwards so each commit is reviewable.

- [ ] **Step 1: Write `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cord — local-first notes as a knowledge graph</title>
<meta name="description" content="Cord is a local-first desktop note-taking app. Vaults, notes, links and tags — a knowledge graph, not a filing cabinet.">
<meta property="og:title" content="Cord">
<meta property="og:description" content="Local-first desktop notes. A knowledge graph, not a filing cabinet.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://cord-note.github.io/">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/site.css">
</head>
<body>
<main>
  <!-- Task 4: hero -->
  <!-- Task 5: what it is -->
  <!-- Task 6: features -->
  <!-- Task 7: screenshots -->
  <!-- Task 8: install -->
  <!-- Task 9: open source -->
</main>
<!-- Task 10: footer -->
<script src="js/releases.js" defer></script>
<script src="js/theme.js" defer></script>
</body>
</html>
```

Both scripts are `defer`, so neither blocks rendering and both run after the
DOM is parsed. Neither is required for the page to be complete.

- [ ] **Step 2: Write `css/site.css`**

```css
/* Layout and type only. Every colour is a token from tokens.css. */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

body {
  background: var(--bg);
  color: var(--text-primary);
  font-family: var(--font-ui);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a { color: var(--link-color); text-decoration-color: var(--link-underline); }
a:hover { color: var(--accent); }

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}

section { padding: 96px 0; border-top: 1px solid var(--border); }
section:first-child { border-top: 0; }

.wrap {
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 24px;
}

h1, h2, h3 { line-height: 1.2; letter-spacing: -0.02em; font-weight: 650; }
h1 { font-size: clamp(2.5rem, 6vw, 4rem); }
h2 { font-size: clamp(1.75rem, 3.5vw, 2.5rem); }
h3 { font-size: 1.125rem; }

.lede { color: var(--text-secondary); font-size: 1.125rem; max-width: 60ch; }

.eyebrow {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.panel {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

@media (max-width: 640px) {
  section { padding: 64px 0; }
}
```

The `padding: 0 24px` on `.wrap` is the 16px-plus gutter that keeps the page off
the edge of a phone screen. Nothing may set a fixed width larger than the
viewport, or the page will scroll sideways.

- [ ] **Step 3: Verify the page loads with no console errors**

Open `index.html` in the browser pane. The page will be blank apart from the
background colour. That is correct at this stage.

Expected: dark `#1a1a1a` background, no console errors other than a 404 for
`assets/favicon.svg`, which Task 11 creates.

- [ ] **Step 4: Verify no colour is hardcoded in the layout stylesheet**

Run: `grep -nE '#[0-9a-fA-F]{3,6}|rgba?\(' css/site.css`
Expected: no output. Any hit is a token that should have been used instead.

- [ ] **Step 5: Commit**

```bash
git add index.html css/site.css
git commit -m "feat: add page shell and base stylesheet"
```

---

### Task 4: Hero section

**Files:**
- Modify: `index.html` — replace the `<!-- Task 4: hero -->` comment
- Modify: `css/site.css` — append

- [ ] **Step 1: Replace the hero comment in `index.html`**

```html
  <section class="hero">
    <div class="wrap">
      <p class="eyebrow">cord-note</p>
      <h1>Notes that know<br>how they connect.</h1>
      <p class="lede">
        Cord is a local-first desktop note-taking app. Vaults, notes, links and
        tags — a knowledge graph, not a filing cabinet. Your notes live in a
        SQLite database on your own machine. There is no account and nothing to
        sign in to.
      </p>

      <div class="cta">
        <a class="btn btn-primary" href="#install">Download Cord</a>
        <a class="btn" href="https://github.com/cord-note/cord">View source</a>
      </div>
      <p class="cta-note" id="version-line">Windows, macOS and Linux · AGPL-3.0</p>

      <figure class="shot shot-hero">
        <img src="assets/hero.png" alt="The Cord editor: a note with tags, inline LaTeX and a backlinks bar along the bottom." loading="eager" width="2560" height="1392">
      </figure>
    </div>
  </section>
```

- [ ] **Step 2: Append the hero styles to `css/site.css`**

```css
/* ── Hero ─────────────────────────────────────────────────────────────── */

.hero { padding-top: 88px; }
.hero h1 { margin: 16px 0 24px; }

.cta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }

.btn {
  display: inline-block;
  padding: 12px 22px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius);
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-weight: 550;
  text-decoration: none;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.btn:hover { background: var(--bg-hover); border-color: var(--border-strong); color: var(--text-primary); }

.btn-primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-fg);
}
.btn-primary:hover { background: var(--accent-hover); border-color: var(--accent-hover); color: var(--accent-fg); }

.cta-note {
  margin-top: 14px;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--text-muted);
}
```

- [ ] **Step 3: Append the screenshot frame styles to `css/site.css`**

These are shared by every screenshot on the page, so they are defined once here
rather than repeated in Task 7. The frame holds its shape whether or not the
image file exists, which is what lets the layout be finished before the
screenshots arrive.

```css
/* ── Screenshot frames ────────────────────────────────────────────────── */

.shot {
  position: relative;
  margin-top: 56px;
  aspect-ratio: 2560 / 1392;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* Placeholder texture, visible only until a real image loads on top of it. */
.shot::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(var(--bg-sidebar) 0 0) 0 0 / 22% 100% no-repeat,
    linear-gradient(var(--border) 0 0) 22% 0 / 1px 100% no-repeat,
    var(--bg-panel);
}

.shot img {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top left;
}

/* A broken or missing image collapses to nothing and reveals the frame
   beneath, rather than showing a torn-page icon. */
.shot img:not([src]), .shot img[src=""] { display: none; }
```

- [ ] **Step 4: Verify in the browser**

Open `index.html` in the browser pane.

Expected: headline, lede, two buttons, and a 16:10 panel beneath them showing
the placeholder frame (a narrow sidebar band on the left against a panel
background). No horizontal scrollbar. No layout shift when the missing
`hero.png` fails to load.

- [ ] **Step 5: Verify at phone width**

Resize the browser pane to 375px wide.

Expected: the headline wraps without overflowing, the two buttons stack or wrap,
and there is no horizontal page scroll.

- [ ] **Step 6: Commit**

```bash
git add index.html css/site.css
git commit -m "feat: add hero section and screenshot frames"
```

---

### Task 5: "What it is" section

**Files:**
- Modify: `index.html` — replace the `<!-- Task 5: what it is -->` comment
- Modify: `css/site.css` — append

- [ ] **Step 1: Replace the comment in `index.html`**

```html
  <section id="what">
    <div class="wrap">
      <p class="eyebrow">What it is</p>
      <h2>Local first, and local only.</h2>
      <div class="two-col">
        <p class="lede">
          Every note is a row in a SQLite database in your own user directory.
          Cord works with the network cable pulled out, because it never needed
          it. There is no account, no sync service and no telemetry.
        </p>
        <p class="lede">
          Notes link to each other with <code>[[wiki links]]</code>, and every
          link is visible from both ends. Tags and vaults organise; links are
          what make the collection worth more than its parts.
        </p>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: Append to `css/site.css`**

```css
/* ── Two-column prose ─────────────────────────────────────────────────── */

.two-col {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  margin-top: 32px;
}

code {
  font-family: var(--font-mono);
  font-size: 0.875em;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: var(--bg-input);
  color: var(--text-primary);
}
```

- [ ] **Step 3: Verify in the browser**

Expected: two columns side by side on a wide pane, one column below 640px, with
`[[wiki links]]` rendered in mono on a slightly inset background.

- [ ] **Step 4: Commit**

```bash
git add index.html css/site.css
git commit -m "feat: add what-it-is section"
```

---

### Task 6: Features section

**Files:**
- Modify: `index.html` — replace the `<!-- Task 6: features -->` comment
- Modify: `css/site.css` — append

- [ ] **Step 1: Replace the comment in `index.html`**

```html
  <section id="features">
    <div class="wrap">
      <p class="eyebrow">Features</p>
      <h2>Four things it does well.</h2>
      <ul class="grid">
        <li class="panel card">
          <h3>Vaults, notes, links, tags</h3>
          <p>Vaults keep unrelated work apart. Tags cut across them. Links
          between notes are bidirectional, so every note shows what points at
          it.</p>
        </li>
        <li class="panel card">
          <h3>Addressable blocks</h3>
          <p>A notepad is a page of blocks you can reference individually.
          Transclude a block into another note and it stays a reference — the
          content is never copied, so it cannot go stale.</p>
        </li>
        <li class="panel card">
          <h3>Search that keeps up</h3>
          <p>Full-text search runs in Rust against SQLite FTS5, in the app
          process. Results arrive as you type rather than after you stop.</p>
        </li>
        <li class="panel card">
          <h3>A small, honest stack</h3>
          <p>A Tauri shell, a Bun sidecar and SQLite. No Electron, no bundled
          browser, no background service phoning home.</p>
        </li>
      </ul>
    </div>
  </section>
```

- [ ] **Step 2: Append to `css/site.css`**

```css
/* ── Feature grid ─────────────────────────────────────────────────────── */

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin-top: 40px;
  list-style: none;
}

.card { padding: 24px; }
.card h3 { margin-bottom: 10px; }
.card p { color: var(--text-secondary); font-size: 0.9375rem; }
```

- [ ] **Step 3: Verify in the browser**

Expected: four cards, two per row on a wide pane, one per row at 375px. Card
backgrounds are `--bg-panel`, one shade off the page background, with a visible
`--border`.

- [ ] **Step 4: Verify the list markers are gone**

Expected: no bullet points. `list-style: none` on `.grid` handles this; if
markers appear, the rule did not land.

- [ ] **Step 5: Commit**

```bash
git add index.html css/site.css
git commit -m "feat: add features grid"
```

---

### Task 7: Screenshot strip

**Files:**
- Modify: `index.html` — replace the `<!-- Task 7: screenshots -->` comment

The frame styles already exist from Task 4. This task only adds markup.

- [ ] **Step 1: Replace the comment in `index.html`**

```html
  <section id="screenshots">
    <div class="wrap">
      <p class="eyebrow">A look at it</p>
      <h2>Quiet by default.</h2>
      <p class="lede">Seven themes, light and dark. The screenshots below are
      the mono dark default.</p>

      <figure class="shot">
        <img src="assets/transclusion.png" alt="A Cord note quoting a block transcluded from another note, shown inset with a link back to its source." loading="lazy" width="2560" height="1392">
        <figcaption>Transclusion — a block from another note, by reference. It cannot go stale.</figcaption>
      </figure>

      <figure class="shot">
        <img src="assets/blocks.png" alt="A Cord note with tags attached to individual blocks in the right-hand gutter, beside a syntax-highlighted code block." loading="lazy" width="2560" height="1392">
        <figcaption>Blocks — tag and link a single block, not just the whole note.</figcaption>
      </figure>

      <figure class="shot">
        <img src="assets/palette.png" alt="The Cord command palette open over a note, listing navigation and settings commands with their shortcuts." loading="lazy" width="2560" height="1392">
        <figcaption>Everything from the keyboard.</figcaption>
      </figure>
    </section>
```

- [ ] **Step 2: Append the caption style to `css/site.css`**

```css
figcaption {
  position: absolute;
  z-index: 2;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 16px;
  background: var(--bg-elevated);
  border-top: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 0.8125rem;
}
```

- [ ] **Step 3: Verify in the browser**

Expected: two stacked 16:10 frames, each with a caption bar pinned to its
bottom edge. The captions are readable against `--bg-elevated` in both colour
schemes.

- [ ] **Step 4: Commit**

```bash
git add index.html css/site.css
git commit -m "feat: add screenshot strip"
```

---

### Task 8: Install section

**Files:**
- Modify: `index.html` — replace the `<!-- Task 8: install -->` comment
- Modify: `css/site.css` — append

The table and the warning are carried over from `cord/README.md` deliberately,
so a visitor never has to leave the page to find out how to install. The
duplication is accepted and noted in the spec.

The four `<a>` elements carry `data-platform` attributes. `js/releases.js`
matches on those in Task 9; changing a value here means changing it there.

- [ ] **Step 1: Replace the comment in `index.html`**

```html
  <section id="install">
    <div class="wrap">
      <p class="eyebrow">Install</p>
      <h2>Download.</h2>
      <p class="lede">Cord is in beta because the installers are young, not
      because the app is half-built. Every platform is built and signed by CI,
      but only Windows has had much real use.</p>

      <ul class="grid downloads">
        <li class="panel card">
          <h3>Windows</h3>
          <p><code>Cord_&lt;version&gt;_x64-setup.exe</code></p>
          <a class="btn btn-primary" data-platform="windows"
             href="https://github.com/cord-note/cord/releases/latest">Download</a>
        </li>
        <li class="panel card">
          <h3>macOS (Apple Silicon)</h3>
          <p><code>Cord_&lt;version&gt;_aarch64.dmg</code></p>
          <a class="btn btn-primary" data-platform="macos"
             href="https://github.com/cord-note/cord/releases/latest">Download</a>
        </li>
        <li class="panel card">
          <h3>Linux (Debian/Ubuntu)</h3>
          <p><code>Cord_&lt;version&gt;_amd64.deb</code></p>
          <a class="btn btn-primary" data-platform="deb"
             href="https://github.com/cord-note/cord/releases/latest">Download</a>
        </li>
        <li class="panel card">
          <h3>Linux (anything else)</h3>
          <p><code>Cord_&lt;version&gt;_amd64.AppImage</code></p>
          <a class="btn btn-primary" data-platform="appimage"
             href="https://github.com/cord-note/cord/releases/latest">Download</a>
        </li>
      </ul>

      <div class="panel notice">
        <h3>It is not code-signed yet</h3>
        <p>Windows and macOS will both object the first time. Nothing is wrong;
        there is simply no certificate behind the binary.</p>
        <ul>
          <li><strong>Windows</strong> — SmartScreen calls it an unrecognised
          app. <em>More info</em> → <em>Run anyway</em>.</li>
          <li><strong>macOS</strong> — Gatekeeper refuses to open it. Right-click
          the app, choose <em>Open</em>, then confirm. Double-clicking will not
          offer that option.</li>
          <li><strong>Linux</strong> — no warning. Mark the AppImage executable
          with <code>chmod +x</code> before running it.</li>
        </ul>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: Append to `css/site.css`**

```css
/* ── Downloads and notice ─────────────────────────────────────────────── */

.downloads .btn { margin-top: 16px; }
.downloads code { font-size: 0.8125rem; word-break: break-all; }

.notice { margin-top: 32px; padding: 24px; }
.notice h3 { margin-bottom: 10px; }
.notice p, .notice li { color: var(--text-secondary); font-size: 0.9375rem; }
.notice ul { margin: 12px 0 0 20px; }
.notice li { margin-bottom: 8px; }
.notice strong { color: var(--text-primary); font-weight: 600; }
```

- [ ] **Step 3: Verify every download link works without JavaScript**

Run: `grep -c 'releases/latest' index.html`
Expected: `4` — every button has a working target before any script runs.

- [ ] **Step 4: Verify the platform hooks are present**

Run: `grep -o 'data-platform="[a-z]*"' index.html | sort`
Expected, one per line: `data-platform="appimage"`, `data-platform="deb"`,
`data-platform="macos"`, `data-platform="windows"`.

- [ ] **Step 5: Verify in the browser**

Expected: four download cards and the notice panel below them. Long filenames
wrap rather than widening the card at 375px.

- [ ] **Step 6: Commit**

```bash
git add index.html css/site.css
git commit -m "feat: add install section with static download links"
```

---

### Task 9: Release link enhancement

**Files:**
- Create: `js/releases.js`

This upgrades links that already work. It must never leave a link worse than it
found it: on any failure it returns without touching the DOM.

- [ ] **Step 1: Write `js/releases.js`**

```js
/* Upgrades the download buttons using the public GitHub releases API.
   The buttons already work without this file; all it adds is a direct asset
   link and the version string. Unauthenticated requests are limited to 60 per
   hour per IP, so every failure path must leave the static links alone. */

const RELEASES_API =
  'https://api.github.com/repos/cord-note/cord/releases/latest';

/* Maps a release asset filename to one of the data-platform values used in
   index.html, or null if it is not a file we offer for download. Order
   matters: .deb and .AppImage are both Linux, so they are matched on their own
   extensions rather than on the word "amd64". */
export function platformFor(filename) {
  const name = filename.toLowerCase();
  if (name.endsWith('.exe')) return 'windows';
  if (name.endsWith('.dmg')) return 'macos';
  if (name.endsWith('.deb')) return 'deb';
  if (name.endsWith('.appimage')) return 'appimage';
  return null;
}

async function enhance() {
  let release;
  try {
    const response = await fetch(RELEASES_API, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!response.ok) return;
    release = await response.json();
  } catch {
    return;
  }

  if (!release || !Array.isArray(release.assets)) return;

  for (const asset of release.assets) {
    const platform = platformFor(asset.name);
    if (!platform) continue;
    const link = document.querySelector(`a[data-platform="${platform}"]`);
    if (link && asset.browser_download_url) {
      link.href = asset.browser_download_url;
    }
  }

  const versionLine = document.getElementById('version-line');
  if (versionLine && release.tag_name) {
    versionLine.textContent =
      `${release.tag_name} · Windows, macOS and Linux · AGPL-3.0`;
  }
}

enhance();

/* Exposed so the verification step in the plan can assert against the real
   shipped function rather than a copy of it. */
window.__cordReleases = { platformFor };
```

Note: the file uses `export` so `platformFor` is importable, which means
`index.html` must load it as a module. Fix that in the next step.

- [ ] **Step 2: Correct the script tag in `index.html`**

Replace:

```html
<script src="js/releases.js" defer></script>
```

with:

```html
<script src="js/releases.js" type="module"></script>
```

Module scripts are deferred by default, so the behaviour is unchanged.

- [ ] **Step 3: Verify the matcher against real filenames**

Open `index.html` in the browser pane and run this in the console:

```js
const { platformFor } = window.__cordReleases;
const cases = [
  ['Cord_1.7.0-beta.1_x64-setup.exe', 'windows'],
  ['Cord_1.7.0-beta.1_aarch64.dmg',   'macos'],
  ['Cord_1.7.0-beta.1_amd64.deb',     'deb'],
  ['Cord_1.7.0-beta.1_amd64.AppImage','appimage'],
  ['latest.json',                      null],
  ['Cord_1.7.0_x64-setup.nsis.zip',    null],
];
cases.every(([f, want]) => platformFor(f) === want)
  ? 'PASS' : 'FAIL: ' + cases.filter(([f,w]) => platformFor(f) !== w).map(c => c[0]);
```

Expected: `"PASS"`

The two null cases matter. `latest.json` is the updater manifest and
`.nsis.zip` is the updater bundle; both are attached to Cord releases and
neither is a thing a human should download.

- [ ] **Step 4: Verify the failure path leaves links intact**

In the console, block the API and reload:

```js
// In DevTools, set network to Offline, then reload the page.
document.querySelector('a[data-platform="windows"]').getAttribute('href')
```

Expected: `"https://github.com/cord-note/cord/releases/latest"` — the static
fallback, unchanged, and no uncaught error in the console.

- [ ] **Step 5: Verify the success path**

With the network on, reload and run:

```js
document.querySelector('a[data-platform="windows"]').getAttribute('href')
```

Expected: a `https://github.com/cord-note/cord/releases/download/...` URL ending
in `.exe`, and the line under the buttons now starts with a version tag.

If the repo has no published release yet, the API returns 404, `enhance()`
returns early, and Step 4's expected result is the correct outcome here too.
Record which case applied.

- [ ] **Step 6: Commit**

```bash
git add js/releases.js index.html
git commit -m "feat: fill download links from the GitHub releases API"
```

---

### Task 10: Footer and theme picker

**Files:**
- Modify: `index.html` — replace the `<!-- Task 9: open source -->` comment and
  the `<!-- Task 10: footer -->` comment
- Create: `js/theme.js`
- Modify: `css/site.css` — append

- [ ] **Step 1: Replace the open-source comment in `index.html`**

```html
  <section id="source">
    <div class="wrap">
      <p class="eyebrow">Open source</p>
      <h2>All of it, under AGPL-3.0.</h2>
      <div class="two-col">
        <p class="lede">
          <a href="https://github.com/cord-note/cord">cord</a> — the desktop
          app. Tauri shell, Bun sidecar, React renderer, SQLite.
        </p>
        <p class="lede">
          <a href="https://github.com/cord-note/shuttle">shuttle</a> — the
          editor layer, built on Tiptap.
        </p>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: Replace the footer comment in `index.html`**

```html
<footer>
  <div class="wrap footer-inner">
    <p>Cord · AGPL-3.0 · <a href="https://github.com/cord-note">cord-note</a></p>
    <div class="theme-picker" hidden>
      <span class="eyebrow">Theme</span>
      <div id="theme-buttons" role="group" aria-label="Accent theme"></div>
    </div>
  </div>
</footer>
```

The picker starts `hidden` and `js/theme.js` unhides it. With scripting off the
control never appears, rather than appearing and doing nothing.

- [ ] **Step 3: Write `js/theme.js`**

```js
/* Accent-theme picker. Sets data-theme on <html>, which is the same mechanism
   the Cord app uses, so the tokens in tokens.css do all the work.
   Light and dark follow the system; this picker does not change that. */

const THEMES = [
  { id: 'mono',      label: 'Mono' },
  { id: 'blue',      label: 'Blue' },
  { id: 'olive',     label: 'Olive' },
  { id: 'teal',      label: 'Teal' },
  { id: 'midnight',  label: 'Midnight' },
  { id: 'rosewood',  label: 'Rosewood' },
  { id: 'parchment', label: 'Parchment' },
];

const STORAGE_KEY = 'cord-site-theme';

function readStored() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return THEMES.some((t) => t.id === value) ? value : 'mono';
  } catch {
    return 'mono';
  }
}

function store(id) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* Private windows and blocked site data both throw here. The theme still
       applies for this page view; it just is not remembered. */
  }
}

function apply(id) {
  /* Mono is the :root default, so it is expressed as the absence of the
     attribute rather than as data-theme="mono". */
  if (id === 'mono') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', id);
  }
  for (const button of document.querySelectorAll('#theme-buttons button')) {
    button.setAttribute('aria-pressed', String(button.dataset.theme === id));
  }
}

function init() {
  const host = document.getElementById('theme-buttons');
  const picker = document.querySelector('.theme-picker');
  if (!host || !picker) return;

  for (const theme of THEMES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.theme = theme.id;
    button.title = theme.label;
    button.setAttribute('aria-label', theme.label);
    button.addEventListener('click', () => {
      apply(theme.id);
      store(theme.id);
    });
    host.appendChild(button);
  }

  picker.hidden = false;
  apply(readStored());
}

init();
```

- [ ] **Step 4: Append to `css/site.css`**

Each swatch shows its own theme's accent colour. The `data-theme` attribute on
the button itself re-scopes the tokens inside it, so no colour is repeated here.

```css
/* ── Footer and theme picker ──────────────────────────────────────────── */

footer { border-top: 1px solid var(--border); padding: 32px 0; }

.footer-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.theme-picker { display: flex; align-items: center; gap: 12px; }
#theme-buttons { display: flex; gap: 8px; }

#theme-buttons button {
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1px solid var(--border-strong);
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  transition: transform 0.12s ease;
}
#theme-buttons button:hover { transform: scale(1.15); }
#theme-buttons button[aria-pressed="true"] {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

- [ ] **Step 5: Give each swatch its own colour**

The rule above paints every swatch with the *page's* current accent. Each
button must instead show the theme it selects. Append:

```css
#theme-buttons button[data-theme="blue"]      { background: #4a8ff5; }
#theme-buttons button[data-theme="olive"]     { background: #c9a84c; }
#theme-buttons button[data-theme="teal"]      { background: #e07a54; }
#theme-buttons button[data-theme="midnight"]  { background: #f7768e; }
#theme-buttons button[data-theme="rosewood"]  { background: #d4856b; }
#theme-buttons button[data-theme="parchment"] { background: #d4a572; }
```

These six literals are the one intentional exception to the "no colour in
site.css" rule, because a swatch is a picture of a colour rather than a use of
one. Task 3's grep check will now report six lines; that is the expected count
and any other hit is a mistake.

- [ ] **Step 6: Verify each theme applies**

Open the page and click each swatch in turn.

Expected: the whole page recolours — background, panels, borders, buttons and
links all move together, because they are all reading the same tokens. Clicking
the first swatch returns the page to mono.

- [ ] **Step 7: Verify the choice persists**

Click Teal, reload the page.

Expected: the page is still Teal, and the Teal swatch has the selected outline.

- [ ] **Step 8: Verify the no-JavaScript path**

Disable JavaScript in the browser pane and reload.

Expected: the page renders fully in mono dark. The theme picker is absent, not
present-and-broken.

- [ ] **Step 9: Commit**

```bash
git add index.html js/theme.js css/site.css
git commit -m "feat: add footer, source links and accent theme picker"
```

---

### Task 11: Favicon

**Files:**
- Create: `assets/favicon.svg`

An SVG favicon needs no build step and no raster sizes. Cord's mark is the
knowledge-graph idea: two nodes and the link between them.

- [ ] **Step 1: Write `assets/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#1a1a1a"/>
  <line x1="10.5" y1="11" x2="21.5" y2="21" stroke="#e2e2e2" stroke-width="2.25" stroke-linecap="round"/>
  <circle cx="10.5" cy="11" r="4" fill="#e2e2e2"/>
  <circle cx="21.5" cy="21" r="4" fill="#e2e2e2"/>
</svg>
```

The colours are `--bg` and `--text-primary` from the mono dark default. A
favicon cannot read CSS custom properties, so these are literals by necessity.

- [ ] **Step 2: Verify it resolves**

Reload the page.

Expected: the browser tab shows the mark, and the console no longer reports a
404 for `assets/favicon.svg`.

- [ ] **Step 3: Commit**

```bash
git add assets/favicon.svg
git commit -m "feat: add favicon"
```

---

### Task 12: Verification sweep

**Files:** none changed unless a check fails.

This runs the spec's verification checklist end to end. Do not skip a check
because an earlier task already covered part of it; the point is to check the
finished page rather than the page as of one task.

- [ ] **Step 1: Confirm no colour crept into the layout stylesheet**

Run: `grep -cE '#[0-9a-fA-F]{3,6}|rgba?\(' css/site.css`
Expected: `6` — the six theme swatches from Task 10, Step 5, and nothing else.

Run: `grep -nE '#[0-9a-fA-F]{3,6}|rgba?\(' css/site.css`
Expected: six lines, every one of them a `#theme-buttons button[data-theme=...]`
rule.

- [ ] **Step 2: Confirm every internal link has a target**

Run: `grep -o 'href="#[a-z-]*"' index.html | sort -u`
Expected: `href="#install"` and nothing else.

Run: `grep -c 'id="install"' index.html`
Expected: `1`

- [ ] **Step 3: Confirm every asset referenced exists**

Run: `grep -o 'src="[^"]*"' index.html`

Expected references: `css/tokens.css`, `css/site.css`, `js/releases.js`,
`js/theme.js`, `assets/favicon.svg`, `assets/hero.png`, `assets/transclusion.png`,
`assets/blocks.png`, `assets/palette.png`.

All four PNGs are present (supplied 2026-09-16). Every file must exist. Check with:

```bash
for f in css/tokens.css css/site.css js/releases.js js/theme.js assets/favicon.svg; do
  test -f "$f" && echo "ok   $f" || echo "MISS $f"
done
```

Expected: five `ok` lines.

- [ ] **Step 4: Check the page at three widths**

In the browser pane, view the page at desktop width, at 768px and at 375px.

Expected at every width: no horizontal page scroll, no text touching the
viewport edge, no element overflowing its panel. Confirm by running
`document.documentElement.scrollWidth <= document.documentElement.clientWidth`
in the console at each width — expected `true` three times.

- [ ] **Step 5: Check both colour schemes**

Switch the browser pane to light, then back to dark.

Expected: in light the page uses `#e8e8e8` backgrounds and `#1a1a1a` text, all
captions and muted text stay readable, and no element keeps a dark-scheme
colour. Confirm the body background with
`getComputedStyle(document.body).backgroundColor` — expected
`rgb(232, 232, 232)` in light and `rgb(26, 26, 26)` in dark.

- [ ] **Step 6: Cycle all seven themes in both schemes**

Click through every swatch in dark, then switch to light and do it again.

Expected: fourteen legible combinations. Any where text drops close to its
background is a token-copy error in `tokens.css`, not a layout problem.

- [ ] **Step 7: Check the page with JavaScript disabled**

Expected: every section renders, all four download buttons point at
`releases/latest`, the version line reads
`Windows, macOS and Linux · AGPL-3.0`, and the theme picker is absent.

- [ ] **Step 8: Validate the HTML**

Paste the page source into <https://validator.w3.org/nu/#textarea>.

Expected: no errors. Warnings about a missing `<h1>`-per-section are acceptable;
anything reported as an error is not.

- [ ] **Step 9: Commit any fixes**

```bash
git add -A
git commit -m "fix: verification sweep corrections"
```

If nothing needed fixing, skip the commit and say so.

---

### Task 13: Publish

**Files:** none.

This task is the developer's to run — it needs GitHub credentials and creates a
public repository.

- [ ] **Step 1: Create the repository**

The name must be exactly `cord-note.github.io`. Any other name serves the site
from a subpath instead of the organisation root.

```bash
gh repo create cord-note/cord-note.github.io --public --source=. --remote=origin
```

- [ ] **Step 2: Push**

```bash
git push -u origin main
```

- [ ] **Step 3: Enable Pages**

In the repository settings, under Pages, set Source to "Deploy from a branch",
branch `main`, folder `/ (root)`.

- [ ] **Step 4: Verify the live site**

Wait for the first deployment, then open <https://cord-note.github.io/>.

Expected: the page renders as it did locally. If the CSS is missing, the paths
resolved wrong; if underscore-prefixed files vanished, `.nojekyll` did not
commit.

- [ ] **Step 5: Verify the live download links**

On the live page, confirm the four buttons resolve to real release assets and
the version line shows the current tag.

---

## Screenshots — supplied

All four landed on 2026-09-16 at 2560x1392 (ratio 1.84), already copied into
`assets/`. The frames use `aspect-ratio: 2560 / 1392` to match, so nothing is
cropped.

| File | What it shows |
|---|---|
| `assets/hero.png` | The editor: a note with tags, inline LaTeX, and the backlinks bar |
| `assets/transclusion.png` | A note quoting a block transcluded from another note |
| `assets/blocks.png` | Per-block tags in the gutter, beside a code block |
| `assets/palette.png` | The command palette open over a note |

No graph-view screenshot was supplied, so the site does not show one and makes
no claim that it does. If one arrives later, it earns a fourth frame in the
screenshot strip; nothing else has to change.
