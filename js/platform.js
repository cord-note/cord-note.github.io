/* Pure helpers with no DOM access, so bun test can import them directly. */

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
  if (name.endsWith('.rpm')) return 'rpm';
  if (name.endsWith('.appimage')) return 'appimage';
  return null;
}

/* The visitor's desktop OS, or null when it is not one Cord ships for.
   Phones are checked first: iOS reports "like Mac OS X" and Android reports
   "Linux", and neither can run a desktop installer. */
export function detectOS(userAgent, uaPlatform) {
  const ua = (userAgent || '').toLowerCase();
  if (/iphone|ipad|ipod|android/.test(ua)) return null;

  const hint = (uaPlatform || '').toLowerCase();
  const source = hint || ua;
  if (source.includes('win')) return 'windows';
  if (source.includes('mac')) return 'macos';
  if (/linux|x11/.test(source)) return 'linux';
  return null;
}

/* The release the site offers: the newest one that is not a draft. The
   /releases/latest endpoint skips pre-releases, and Cord's current line is a
   beta, so it would advertise the previous version. The API lists newest
   first. Returns null when nothing has a usable asset list. */
export function pickRelease(releases) {
  if (!Array.isArray(releases)) return null;
  const release = releases.find((r) => r && !r.draft);
  return release && Array.isArray(release.assets) ? release : null;
}
