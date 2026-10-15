// Commit öncesi sır taraması. Bulunan değerleri ASLA yazdırmaz; yalnız dosya, satır ve tür gösterir.
// Kullanım: node scripts/sir-tarama.mjs [--karsi <dosya>]...
//   --karsi: o dosyadaki JSONBin anahtarlarını / bin kimliklerini toplar ve depoda geçip geçmediğine bakar
//            (ör. eski panel veya uygulama kaynağı). Değerler yine yazdırılmaz.
import { readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).split('\n').filter(Boolean);
const files = [...new Set([...git('ls-files'), ...git('ls-files', '--others', '--exclude-standard')])]
  .filter(f => { try { return statSync(f).isFile(); } catch (e) { return false; } });

const RULES = [
  ['JSONBin anahtarı ($2a$/$2b$)', /\$2[aby]\$\d\d\$[./A-Za-z0-9]{20,}/g],
  ['X-Master-Key / X-Access-Key değeri', /X-(Master|Access)-Key['"]?\s*[:=]\s*['"`][^'"`\s]{8,}/gi],
  ['"Master Key" yanında değer', /master[\s_-]?key['"]?\s*[:=]\s*['"`][^'"`\s]{8,}/gi],
  ['24 haneli onaltılık kimlik (JSONBin bin kimliği biçimi)', /\b[0-9a-f]{24}\b/g],
  ['Özel anahtar bloğu', /-----BEGIN [A-Z ]*PRIVATE KEY-----/g],
];

const extra = [];
for (let i = 2; i < process.argv.length; i++) if (process.argv[i] === '--karsi') {
  const src = readFileSync(process.argv[++i], 'utf8');
  for (const m of src.matchAll(/\$2[aby]\$\d\d\$[./A-Za-z0-9]{20,}|\b[0-9a-f]{24}\b/g)) extra.push(m[0]);
}
const known = [...new Set(extra)];

let hits = 0;
for (const f of files) {
  const lines = readFileSync(f, 'utf8').split('\n');
  lines.forEach((ln, i) => {
    for (const [name, re] of RULES) for (const _ of ln.matchAll(re)) { hits++; console.log(`❌ ${f}:${i + 1}  ${name}`); }
    known.forEach((v, j) => { if (ln.includes(v)) { hits++; console.log(`❌ ${f}:${i + 1}  karşılaştırma dosyasındaki değer #${j + 1}`); } });
  });
}
console.log(`\nTaranan dosya: ${files.length}` + (process.argv.includes('--karsi') ? ` · karşılaştırılan değer: ${known.length}` : ''));
for (const f of files) console.log('  · ' + f);
console.log(hits ? `\n❌ ${hits} şüpheli bulgu — commit etmeyin.` : '\n✅ Sır bulunmadı.');
process.exit(hits ? 1 : 0);
