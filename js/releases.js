/* Upgrades the download links using the public GitHub releases API.
   The links already work without this file; all it adds is a direct asset
   link, the version string, and a hero button for the visitor's OS.
   Unauthenticated requests are limited to 60 per hour per IP, so every
   failure path must leave the static links alone. */

import { detectOS, pickRelease, platformFor } from './platform.js';

const RELEASES_API =
  'https://api.github.com/repos/cord-note/cord/releases?per_page=10';

const OS_LABEL = { windows: 'Windows', macos: 'macOS' };

/* Windows and macOS each have one installer, so the hero button can point at
   it. Linux has several formats, so it scrolls to the list instead. */
function updateHero(os) {
  const hero = document.getElementById('hero-download');
  if (!hero || !os) return;

  document
    .querySelectorAll(`[data-os="${os}"]`)
    .forEach((row) => row.classList.add('is-current'));

  const label = OS_LABEL[os];
  const link = document.querySelector(`a[data-platform="${os}"]`);
  if (label && link) {
    hero.textContent = `Download for ${label}`;
    hero.href = link.href;
  } else if (os === 'linux') {
    hero.textContent = 'Download for Linux';
  }
}

async function enhance() {
  const os = detectOS(navigator.userAgent, navigator.userAgentData?.platform);
  updateHero(os);

  let release;
  try {
    const response = await fetch(RELEASES_API, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!response.ok) return;
    release = pickRelease(await response.json());
  } catch {
    return;
  }
  if (!release) return;

  for (const asset of release.assets) {
    const platform = platformFor(asset.name);
    if (!platform || !asset.browser_download_url) continue;

    const link = document.querySelector(`a[data-platform="${platform}"]`);
    if (link) {
      link.href = asset.browser_download_url;
      continue;
    }
    /* A format listed as "coming" has shipped: turn the placeholder into a
       real button. */
    const soon = document.querySelector(`[data-soon="${platform}"]`);
    if (soon) {
      const button = document.createElement('a');
      button.className = 'btn';
      button.dataset.platform = platform;
      button.href = asset.browser_download_url;
      button.textContent = 'Download';
      soon.replaceWith(button);
    }
  }

  if (release.tag_name) {
    document.querySelectorAll('[data-version]').forEach((el) => {
      el.textContent = release.tag_name;
    });
  }
  updateHero(os);
}

enhance();
