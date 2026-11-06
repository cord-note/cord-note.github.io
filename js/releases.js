// Points download links at the newest release. Links work without this file.
import { detectOS, formatSize, pickRelease, platformFor } from './platform.js';

const API = 'https://api.github.com/repos/cord-note/cord/releases?per_page=10';
const LABEL = { windows: 'Windows', macos: 'macOS', linux: 'Linux' };

const os = detectOS(navigator.userAgent, navigator.userAgentData?.platform);

// Windows and macOS have one installer. Linux has several, so it goes to the list.
function updateHero() {
  document.querySelectorAll(`[data-os="${os}"]`).forEach((row) => row.classList.add('is-current'));
  const hero = document.getElementById('hero-download');
  if (!hero || !os) return;
  hero.querySelector('[data-hero-label]').textContent = `Download for ${LABEL[os]}`;

  const link = document.querySelector(`a[data-platform="${os}"]`);
  if (link) hero.href = link.href;
  const meta = document.getElementById('hero-meta');
  const size = document.querySelector(`[data-size="${os}"]`)?.textContent;
  const version = document.querySelector('[data-version]')?.textContent;
  if (meta) meta.textContent = [version, size, os === 'linux' ? 'deb, rpm, Arch, AppImage' : null].filter(Boolean).join(' · ');
}

async function enhance() {
  updateHero();
  let release;
  try {
    const response = await fetch(API, { headers: { Accept: 'application/vnd.github+json' } });
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
    if (link) link.href = asset.browser_download_url;
    const size = document.querySelector(`[data-size="${platform}"]`);
    if (size && asset.size) size.textContent = formatSize(asset.size);
    const file = document.querySelector(`[data-file="${platform}"]`);
    if (file) file.textContent = asset.name;
  }
  if (release.tag_name) {
    document.querySelectorAll('[data-version]').forEach((el) => {
      el.textContent = release.tag_name;
    });
  }
  updateHero();
}

enhance();
