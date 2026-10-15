// src/panel.html → index.html: sürümü yazar, satır içi betiğin SHA-256 özetini CSP'ye ekler.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
let html = readFileSync(new URL('../src/panel.html', import.meta.url), 'utf8').replace(/__VERSION__/g, pkg.version);

const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
if (scripts.length !== 1) throw new Error('Tam olarak bir satır içi betik bekleniyordu, bulunan: ' + scripts.length);
if (/<script\s+src=|\son[a-z]+\s*=/i.test(html.replace(scripts[0][0], ''))) throw new Error('Dış betik veya satır içi olay özniteliği yasak (CSP).');
const sum = createHash('sha256').update(scripts[0][1], 'utf8').digest('base64');
// Sırrı andıran dizgi kaynakta olmamalı (JSONBin anahtarları $2a$/$2b$ ile başlar)
if (/\$2[aby]\$\d\d\$/.test(html)) throw new Error('Kaynakta anahtar benzeri dizgi var — derleme durduruldu.');

const csp = [
  "default-src 'none'",
  `script-src 'sha256-${sum}'`,
  "style-src 'unsafe-inline'",
  'connect-src https://api.jsonbin.io',
  "img-src 'self' data:",
  "manifest-src 'self'",
  "worker-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "object-src 'none'",
].join('; ');
html = html.replace('__CSP__', csp);
writeFileSync(new URL('../index.html', import.meta.url), html);
console.log(`index.html yazıldı · sürüm ${pkg.version} · kod özeti sha256-${sum}`);
