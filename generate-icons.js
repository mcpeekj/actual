// Generate all favicon/app-icon PNGs from squirrel-logo.png
const sharp = require('sharp');
const path = require('path');

const logoPath = path.join(__dirname, 'squirrel-logo.png');
const outDir = path.join(__dirname, 'packages', 'desktop-client', 'public');

// Standard icons: transparent background, contained
const standard = {
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'apple-touch-icon.png': 180,
  'android-chrome-192x192.png': 192,
  'android-chrome-512x512.png': 512,
  'mstile-150x150.png': 150,
};

// Theme purple (matches site.webmanifest theme_color)
const THEME = { r: 92, g: 61, b: 187, alpha: 1 };

async function renderLogo(size) {
  return sharp(logoPath)
    .resize(size, size, { fit: 'contain' })
    .png()
    .toBuffer();
}

async function main() {
  for (const [file, size] of Object.entries(standard)) {
    const bg = file === 'apple-touch-icon.png' ? { r: 255, g: 255, b: 255, alpha: 1 } : null;
    if (bg) {
      const base = await sharp({ create: { width: size, height: size, channels: 4, background: bg } }).png().toBuffer();
      const fg = await renderLogo(size);
      await sharp(base).composite([{ input: fg, gravity: 'center' }]).png().toFile(path.join(outDir, file));
    } else {
      await sharp(await renderLogo(size)).toFile(path.join(outDir, file));
    }
    console.log('wrote', file);
  }

  // Maskable icons: squirrel scaled to 80% on solid theme background
  for (const [file, size] of [['maskable-192x192.png', 192], ['maskable-512x512.png', 512]]) {
    const base = await sharp({ create: { width: size, height: size, channels: 4, background: THEME } }).png().toBuffer();
    const fg = await renderLogo(Math.round(size * 0.8));
    await sharp(base).composite([{ input: fg, gravity: 'center' }]).png().toFile(path.join(outDir, file));
    console.log('wrote', file);
  }

  // favicon.ico: 32x32 PNG written as .ico (browsers sniff PNG content)
  await sharp(await renderLogo(32)).toFile(path.join(outDir, 'favicon.ico'));
  console.log('wrote favicon.ico');
}

main().catch((e) => { console.error(e); process.exit(1); });
