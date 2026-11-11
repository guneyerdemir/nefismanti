# Nefis Mantı — Modern E-Ticaret ve Kurumsal Web Sitesi

Geleneksel Türk mantı lezzetini modern gıda teknolojisi, -18°C soğuk zincir teslimatı ve WhatsApp sipariş altyapısıyla buluşturan, hafif ve yüksek performanslı e-ticaret platformu.

🌐 **Canlı Subdomain:** [https://nefismanti.guneyerdemir.com](https://nefismanti.guneyerdemir.com)  
📱 **WhatsApp & Çağrı Hattı:** 0507 365 39 37  
📍 **Üretim & Merkez:** Güney Mh. 1140 Sok. no:36 Konak, İzmir

---

## 🚀 Öne Çıkan Özellikler

* **Modern-Geleneksel Tasarım Dili:** Sıcak toprak tonları, iştah açıcı görseller, okunaklı tipografi ve ferah yerleşim.
* **Hafif ve Bağımsız Altyapı:** Harici ağır framework veya kütüphane olmadan saf semantik HTML5, CSS3 ve Vanilla JavaScript.
* **E-Ticaret & Alışveriş Sepeti (`js/cart.js`):**
  * `LocalStorage` destekli dinamik sepet çekmecesi (drawer).
  * 750 ₺ üzeri ücretsiz kargo baremi ve dinamik ilerleme çubuğu.
  * Anlık ara toplam, kargo bedeli ve genel toplam hesaplama.
* **WhatsApp Sipariş Entegrasyonu:**
  * **Sepetten Tek Tıkla WhatsApp Siparişi:** Sepetteki tüm ürünleri, paket gramajlarını, adetleri, ara toplamı, kargo bilgisini ve teslimat adresini düzenli bir mesaj formatına dönüştürerek doğrudan WhatsApp'a aktarır.
  * **Ürün Detayından Hızlı Sipariş:** Seçilen ürün ve adet için anında WhatsApp sipariş mesajı oluşturur.
  * **İletişim & Talep Formu:** Form gönderildiğinde talebi doğrudan WhatsApp sipariş hattına yönlendirir.
  * **Sabit Kayan WhatsApp Butonu:** Sayfanın sağ alt köşesinde dikkat çekici animasyonlu hızlı destek butonu.
* **Ürün Kataloğu & Detay Modalı (`js/products.js`, `js/main.js`):**
  * Dinamik kategori filtreleme (Tüm Ürünler, Paketli Ürünler, Toptan & Horeca, Özel Lezzetler).
  * Zengin ürün detay modalı: Net gramaj, porsiyon, içindekiler, alerjen uyarıları, -18°C saklama koşulları ve tencerede pişirme süreleri.
* **Zengin Sayfa İçerikleri:**
  * **Neden Nefis Mantı?:** %100 Dana eti, -40°C IQF şoklama, yapışmayan ince hamur, strafor kutulu soğuk zincir.
  * **Üretim & Kalite:** Hamur yoğurmadan şoklamaya ve sevkiyata 5 adımlı görsel süreç.
  * **Kusursuz Mantı Pişirme Rehberi:** Ustasından haşlama süreleri ve soslama püf noktaları.
  * **S.S.S. (FAQ):** Akordeon formatında kargoda erime önlemleri, raf ömrü ve toptan alım yanıtları.
* **Teknik SEO & Yasal Uyum:**
  * Schema.org JSON-LD (`Organization`, `WebSite`, `FAQPage`, `Product` şemaları).
  * Open Graph, Twitter Cards, `sitemap.xml` ve `robots.txt`.
  * KVKK aydınlatma penceresi ve Çerez İzin Bildirimi banner'ı.

---

## 📂 Dosya ve Dizin Yapısı

```
nefis_manti/
├── index.html              # Ana sayfa semantik iskeleti ve modallar
├── CNAME                   # GitHub Pages özel subdomain tanımı (nefismanti.guneyerdemir.com)
├── robots.txt              # Arama motoru tarama direktifleri
├── sitemap.xml             # XML site haritası
├── assets/
│   └── images/             # Optimize edilmiş WebP ürün, üretim ve sunum görselleri
├── css/
│   └── style.css           # Modern-geleneksel tasarım sistemi ve responsive stiller
├── js/
│   ├── config.js           # İletişim, WhatsApp no, kargo baremi ve site parametreleri
│   ├── products.js         # Ürün kataloğu veri modeli (fiyat, gramaj, içerik)
│   ├── cart.js             # Alışveriş sepeti, WhatsApp mesaj motoru ve bildirimler
│   ├── checkout.js         # Sipariş ve teslimat adresi modal yöneticisi
│   └── main.js             # Menü, filtreleme, FAQ akordeon ve form etkileşimleri
└── test_verification.py    # Otomatik test ve doğrulama betiği
```

---

## ⚙️ Yapılandırma (`js/config.js`)

Telefon numarası, WhatsApp hattı, adres veya kargo baremi gibi bilgileri güncellemek için `js/config.js` dosyasını düzenleyebilirsiniz:

```javascript
const SITE_CONFIG = {
  brandName: "Nefis Mantı",
  phone: "+90 507 365 39 37",
  phoneDisplay: "0507 365 39 37",
  whatsappNumber: "905073653937",
  email: "siparis@nefismanti.com",
  address: "Güney Mh. 1140 Sok. no:36 Konak, İzmir",
  freeShippingThreshold: 750, // Ücretsiz kargo baremi (TL)
  shippingFee: 65             // Standart kargo ücreti (TL)
};
```

---

## 🧪 Yerel Ortamda Test Etme

Sitenin yerel kopyasını çalıştırmak için:

```powershell
python -m http.server 8085
```

Tarayıcınızdan `http://localhost:8085` adresini ziyaret ederek siteyi inceleyebilirsiniz.

Otomatik doğrulama testlerini çalıştırmak için:

```powershell
python test_verification.py
```

---

## 🌐 Canlı Yayın ve Sunucu Dağıtımı (Hetzner VPS + Cloudflare)

Proje, kurumsal Hetzner Linux VPS (`2.29.154.116`) üzerinde Docker Nginx ve Let's Encrypt SSL altyapısıyla çalışmaktadır.

* **Canlı URL:** [https://nefismanti.guneyerdemir.com](https://nefismanti.guneyerdemir.com)
* **SSL Sertifikası:** Let's Encrypt TLS 1.3 / HTTP/2 (Otomatik yenilenen)
* **DNS & CDN:** Cloudflare Proxy
* **Sunucu Dizini:** `/var/www/nefismanti`
* **Web Sunucu:** Nginx (Gzip aktif, WebP/CSS/JS için 30 günlük tarayıcı önbelleklemesi)

### Sunucuda Güncelleme Yapmak İçin:
```bash
ssh root@2.29.154.116 "cd /var/www/nefismanti && git pull origin main"
```

---

© 2026 Nefis Mantı. Tüm hakları saklıdır.

