// src/icon.svg → icons/*.png (192, 512, maskable 512, apple-touch 180). Yalnız ikon değişince çalıştırılır.
// Gerekli: Google Chrome + puppeteer-core (varsayılan: ~/DigiPark-Tests/node_modules; PUPPETEER_DIR ile değiştirilebilir).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';

const dir = process.env.PUPPETEER_DIR || os.homedir() + '/DigiPark-Tests/node_modules';
const puppeteer = createRequire(dir + '/')('puppeteer-core');
const svg = readFileSync(new URL('../src/icon.svg', import.meta.url), 'utf8');
// maskable/apple: köşesiz tam kare, işaret güvenli alanda (%80) — Android ve iOS köşeyi kendisi yuvarlar
const square = svg.replace(/rx="112"/, 'rx="0"').replace('<g id="mark">', '<g id="mark" transform="translate(256 262) scale(.78) translate(-256 -258)">');
const out = new URL('../icons/', import.meta.url);
mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
const page = await browser.newPage();
for (const [name, size, src, transparent] of [['icon-192.png', 192, svg, true], ['icon-512.png', 512, svg, true], ['icon-maskable-512.png', 512, square, false], ['apple-touch-icon.png', 180, square, false]]) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(`<html><body style="margin:0;background:transparent">${src.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
  writeFileSync(new URL(name, out), await page.screenshot({ omitBackground: transparent, type: 'png' }));
  console.log('icons/' + name);
}
await browser.close();
