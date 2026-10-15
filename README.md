# DigitaraLab Lisans paneli

DigiPark lisanslarını yöneten tek dosyalık panel (`index.html`). **Kodda hiçbir gizli bilgi yoktur.**
Bin kimlikleri ve JSONBin Master Key kurulumda girilir. Yönetici şifresinden PBKDF2-SHA256 ile
(600.000 tur) türetilen anahtarla AES-GCM ile şifrelenir ve yalnız o cihazın IndexedDB'sinde durur.

- Kaynak: `src/panel.html` → `npm run build` → `index.html`. Derleme, satır içi betiğin SHA-256 özetini
  CSP'ye yazar. Bağlantı yalnız `https://api.jsonbin.io` adresine yapılabilir.
- Sayfanın altındaki "kod özeti", derleme çıktısındaki özetle aynı olmalıdır.
- Yönetim kaydı (işlem günlüğü, müşteri kimlikleri, ayarlar) ayrı bir JSONBin kaydındadır ve yönetici
  şifresiyle şifrelidir.
⛔ **KURAL:** TÜM müşteriler 0.3.2'ye geçene kadar JSONBin'deki `keys` alanı **asla silinmez, yapısı değiştirilmez**
(0.3.1 ve öncesi yalnız `keys`'i okur). Panel her lisans değişikliğini `keys`'e yazar; şifreli `v2` kopyası bunun yanına eklenir, yerine geçmez.

- Lisans kaydında `keys` altındaki alanlar silinmez ve adları değişmez. Eski DigiPark sürümleri bu alanları okur.
- `v2`: anahtardan türetilen kimlik (PBKDF2-SHA256, 200.000 tur, tuz `DigitaraLab/DigiPark/lisans/v2`,
  64 bayt: ilk 16 bayt kimlik (hex), sonraki 32 bayt AES-GCM anahtarı). Değer `base64(iv[12] ‖ şifreli)`
  biçimindedir, AAD olarak kimlik kullanılır, içerik `{v:2, ...kayıt}` şeklindedir.

## Oturum 2 (0.3.2)

- **Modüller** (kartta 🧩): Puan Kulübü `loyalty` = `false` / `"trial"` / `true`; deneme için `loyaltyTrialStart`
  (YYYY-AA-GG) ve `loyaltyTrialDays` (1–365) yazılır. `profile: "sadakat"`, `noBranding: true` (ibare gizli).
- **Ayarlar** (yönetim kaydında, şifreli): paketler (ad/ay/fiyat), deneme varsayılanları (ana 7, Puan Kulübü 14 gün),
  WhatsApp şablonları (`{isletme} {anahtar} {bitis} {ay} {gun}`). Fiyat yalnız günlüğe yazılır.
- **Eski kayıtları müşteriye bağla**: kimliksiz anahtarlar ada göre gruplanır (tek başına olanlar da listelenir).
  Yalnız işaretlenenler bağlanır. Bağlantı (`links`) ve **panelde tür** işareti (`keyTypes`, ör. `DENEME-` önekli ama ücretli
  eski müşteri → "Tam lisans") **yalnız şifreli yönetim kaydına** yazılır; lisans kaydındaki `keys`'e dokunulmaz.
  Tür, kartın 🧩 Modüller penceresinden de değiştirilebilir.
- **Yönetim kaydı ayrı hesapta**: kurulumda ya da Ayarlar › Yönetim kaydını taşı. Eski kayıtta yalnız şifreli
  "taşındı" işareti kalır; diğer cihazlar açılışta yeni hesabın Master Key'ini sorar. Master Key yenilenirse
  Ayarlar › Master Key'i güncelle (her cihazda).
- **PWA**: `manifest.webmanifest`, `sw.js` (derlemede `src/sw.js`'ten, sürüm damgalı), `icons/`.
  İkonlar `src/icon.svg`'den: `node scripts/ikonlar.mjs` (Chrome + puppeteer-core gerekir).
- **Commit öncesi**: `node scripts/sir-tarama.mjs [--karsi <dosya>]` — değer yazdırmadan sır arar.
