# Site Remake Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild cord-note.github.io as two static pages (Cord, Shuttle) with two distinct themes — editorial Paper and precision Charcoal.

**Architecture:** Plain HTML/CSS/JS served from `main`, no build. `tokens.css` holds both themes' tokens; `site.css` holds layout plus a few `[data-theme="dark"]`-scoped rules that change treatment (grid, crop marks, mono labels, precise motif). Pure logic (`platformFor`, `detectOS`) lives in `js/platform.js` so `bun test` can import it without a DOM.

**Tech Stack:** HTML, CSS custom properties, ES modules, Google Fonts (Fraunces, Inter Tight, JetBrains Mono), `bun test`.

Spec: `docs/superpowers/specs/2026-09-30-site-remake-design.md`.

---

## File map

| File | Responsibility |
|---|---|
| `js/platform.js` | Pure: `platformFor(filename)`, `detectOS(ua, uaPlatform)` |
| `js/__tests__/platform.test.js` | `bun test` for the above |
| `js/releases.js` | Fetch latest release, rewrite `a[data-platform]`, fill `[data-version]`, set hero button for the visitor's OS |
| `js/theme.js` | Theme toggle; saves to localStorage in try/catch |
| `js/motif.js` | Adds `.is-drawn` to motif SVGs when they scroll into view |
| `css/tokens.css` | Paper tokens on `:root`, Charcoal tokens under the prefers-color-scheme guard and `[data-theme="dark"]` |
| `css/site.css` | Layout, components, theme-scoped treatments |
| `index.html` | Cord page |
| `shuttle/index.html` | Shuttle page |
| `assets/favicon.svg` | Redrawn to match (ink on paper) |
| `README.md` | Updated to describe the new structure |

Removed: the old seven-theme `tokens.css` content and accent picker.

---

### Task 1: Pure platform logic, test first

**Files:** Create `js/platform.js`, `js/__tests__/platform.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { describe, expect, test } from 'bun:test';
import { detectOS, platformFor } from '../platform.js';

describe('platformFor', () => {
  test.each([
    ['Cord_2.0.0_x64-setup.exe', 'windows'],
    ['Cord_2.0.0_aarch64.dmg', 'macos'],
    ['Cord_2.0.0_amd64.deb', 'deb'],
    ['Cord-2.0.0-1.x86_64.rpm', 'rpm'],
    ['Cord_2.0.0_amd64.AppImage', 'appimage'],
  ])('%s → %s', (name, platform) => {
    expect(platformFor(name)).toBe(platform);
  });

  test.each([
    'Cord_2.0.0_x64-setup.exe.sig',
    'Cord_2.0.0_amd64.AppImage.sig',
    'latest.json',
    'Cord_aarch64.app.tar.gz',
  ])('ignores %s', (name) => {
    expect(platformFor(name)).toBeNull();
  });
});

describe('detectOS', () => {
  test('windows', () => {
    expect(detectOS('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '')).toBe('windows');
  });
  test('mac', () => {
    expect(detectOS('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)', '')).toBe('macos');
  });
  test('linux', () => {
    expect(detectOS('Mozilla/5.0 (X11; Linux x86_64)', '')).toBe('linux');
  });
  test('uaData platform wins', () => {
    expect(detectOS('', 'macOS')).toBe('macos');
  });
  test('phones are not desktops', () => {
    expect(detectOS('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', '')).toBeNull();
    expect(detectOS('Mozilla/5.0 (Linux; Android 14)', '')).toBeNull();
  });
});
```

- [ ] **Step 2:** `bun test js` → FAIL (module not found).
- [ ] **Step 3:** Implement `platformFor` (suffix match on `.exe .dmg .deb .rpm .appimage`, else `null`) and `detectOS` (null for iPhone/iPad/Android; then check uaPlatform, then UA for `win`, `mac`, `linux|x11`).
- [ ] **Step 4:** `bun test js` → PASS.
- [ ] **Step 5:** Commit `feat: pure platform detection with tests`.

### Task 2: Tokens

**Files:** Replace `css/tokens.css`

- [ ] Paper tokens on `:root`: `--paper #f4f0e8`, `--paper-2 #ebe5d9`, `--ink #1c1a17`, `--ink-2 #5a544b`, `--rule #d6cebf`, `--accent #7a2630`, `--accent-ink #f4f0e8`, font stacks, `--measure 64ch`.
- [ ] Charcoal tokens: `--paper #17181a`, `--paper-2 #1e1f22`, `--ink #e6e3dc`, `--ink-2 #9a968d`, `--rule #2e3034`, `--accent #e0664a`, `--accent-ink #17181a`, `--grid rgba(230,227,220,.04)`. Declared under `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {…} }` and `:root[data-theme="dark"] {…}`.
- [ ] Commit `feat: paper and charcoal tokens`.

### Task 3: Stylesheet

**Files:** Replace `css/site.css`

- [ ] Base: body on `--paper`, type scale, `.wrap` (max 1120px, 16px gutter on phones), header, footer, buttons, section layout with a main column and a margin column for `.note` annotations (folds inline under 900px).
- [ ] Components: `.feature-list` (hairline-ruled rows, not cards), `.shot` (shadow in paper), `.downloads` table-like list, `pre.code` blocks, `.motif` SVG with `stroke-dasharray` draw-in on `.is-drawn`, reduced-motion shows it drawn.
- [ ] Charcoal treatments, all scoped to dark (shared via a `--is-dark` pattern: repeat selectors under the media guard and `[data-theme="dark"]`): background grid, section numbers (`counter`) rendered in mono, headings lighter/tighter, `.note` and eyebrows in uppercase mono, `.shot` hairline frame + corner marks via pseudo-elements, crop marks on sections, motif swaps from `.hand` to `.precise` paths.
- [ ] Commit `feat: site stylesheet with paper and charcoal treatments`.

### Task 4: Scripts

**Files:** Rewrite `js/releases.js`, `js/theme.js`; create `js/motif.js`

- [ ] `releases.js` imports `platformFor`, `detectOS`; on success rewrites links and fills every `[data-version]`; picks the hero button (`#hero-download`) label/href for the visitor's OS (Linux → `#install`, since there are three formats). All failures leave static links.
- [ ] `theme.js`: button `#theme-toggle` (hidden until JS runs) flips `data-theme` between `light` and `dark`, stores in `localStorage` key `cord-site-theme` in try/catch, updates `aria-pressed` and label.
- [ ] Inline `<head>` snippet in both pages applies the saved theme before paint.
- [ ] `motif.js`: IntersectionObserver adds `.is-drawn`; without IO, adds it immediately.
- [ ] `bun test js` still passes. Commit `feat: release links, theme toggle, motif draw-in`.

### Task 5: Cord page

**Files:** Replace `index.html`

- [ ] Sections per spec §Pages `/`: hero, local first, graph, notepads & blocks, search, screenshots, install (5 platforms + unsigned notes), built on Shuttle, open source. Each section has `.eyebrow`, heading, body, optional `.note`, optional motif SVG with both `.hand` and `.precise` groups.
- [ ] Commit `feat: Cord page`.

### Task 6: Shuttle page

**Files:** Create `shuttle/index.html`

- [ ] Sections per spec §Pages `/shuttle/`, content from `shuttle/README.md`: hero with npm/GitHub links, features, install (npm/pnpm/yarn, peers, GitHub Packages), quick start (`createFakeHost` short snippet + host outline), `ShuttleHost`, licence. Links use `../` paths.
- [ ] Commit `feat: Shuttle page`.

### Task 7: Favicon, README, cleanup

- [ ] Redraw `assets/favicon.svg` in paper/ink/oxblood; update README (structure, themes, `bun test js`).
- [ ] Commit `chore: favicon and README for the remake`.

### Task 8: Verify

- [ ] Serve locally (`bunx serve` via launch.json), open both pages in the browser pane.
- [ ] Check: no console errors; phone (375) and desktop widths; both themes via toggle; no horizontal scroll (`document.documentElement.scrollWidth <= innerWidth`); download links present with JS blocked (static HTML).
- [ ] Screenshot both themes for the user. Fix anything found, commit.
