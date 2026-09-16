/* Upgrades the download buttons using the public GitHub releases API.
   The buttons already work without this file; all it adds is a direct asset
   link and the version string. Unauthenticated requests are limited to 60 per
   hour per IP, so every failure path must leave the static links alone. */

const RELEASES_API =
  'https://api.github.com/repos/cord-note/cord/releases/latest';

/* Maps a release asset filename to one of the data-platform values used in
   index.html, or null if it is not a file we offer for download. Signature
   files (.sig), the updater manifest and the macOS updater bundle all end up
   null, which is why this matches on full extensions rather than on substrings
   like "amd64". */
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

/* Exposed so the verification step can assert against the real shipped
   function rather than a copy of it. */
window.__cordReleases = { platformFor };
