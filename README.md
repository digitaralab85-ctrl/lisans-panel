# DigitaraLab Lisans paneli

DigiPark lisanslarını yöneten tek dosyalık panel (`index.html`). **Kodda hiçbir gizli bilgi yoktur.**
Bin kimlikleri ve JSONBin Master Key kurulumda girilir. Yönetici şifresinden PBKDF2-SHA256 ile
(600.000 tur) türetilen anahtarla AES-GCM ile şifrelenir ve yalnız o cihazın IndexedDB'sinde durur.

- Kaynak: `src/panel.html` → `npm run build` → `index.html`. Derleme, satır içi betiğin SHA-256 özetini
  CSP'ye yazar. Bağlantı yalnız `https://api.jsonbin.io` adresine yapılabilir.
- Sayfanın altındaki "kod özeti", derleme çıktısındaki özetle aynı olmalıdır.
- Yönetim kaydı (işlem günlüğü, müşteri kimlikleri, ayarlar) ayrı bir JSONBin kaydındadır ve yönetici
  şifresiyle şifrelidir.
- Lisans kaydında `keys` altındaki alanlar silinmez ve adları değişmez. Eski DigiPark sürümleri bu alanları okur.
- `v2`: anahtardan türetilen kimlik (PBKDF2-SHA256, 200.000 tur, tuz `DigitaraLab/DigiPark/lisans/v2`,
  64 bayt: ilk 16 bayt kimlik (hex), sonraki 32 bayt AES-GCM anahtarı). Değer `base64(iv[12] ‖ şifreli)`
  biçimindedir, AAD olarak kimlik kullanılır, içerik `{v:2, ...kayıt}` şeklindedir.
