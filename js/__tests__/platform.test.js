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
