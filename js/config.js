/**
 * Nefis Mantı — Site ve Mağaza Genel Yapılandırması
 * Alan adı: https://nefismanti.com
 * İletişim ve kargo ayarlarını bu dosyadan kolayca yönetebilirsiniz.
 */
const SITE_CONFIG = {
  brandName: "Nefis Mantı",
  legalName: "Nefis Mantı Gıda Üretim San. ve Tic. Ltd. Şti.",
  tagline: "Her Lokmada Ev Sıcaklığı · Geleneksel Türk Mantısı",
  domain: "https://nefismanti.guneyerdemir.com",
  
  // İletişim Bilgileri (İhtiyaca göre güncellenebilir)
  phone: "+90 507 365 39 37",
  phoneDisplay: "0507 365 39 37",
  whatsappNumber: "905073653937", // WhatsApp sipariş yönlendirme numarası (ülke koduyla, boşluksuz)
  email: "siparis@nefismanti.com",
  infoEmail: "bilgi@nefismanti.com",
  address: "Güney Mh. 1140 Sok. no:36 Konak, İzmir",
  workingHours: "Hafta içi 08:30 - 18:00, Cumartesi 09:00 - 14:00",
  
  // E-Ticaret ve Kargo Parametreleri
  currency: "₺",
  freeShippingThreshold: 750, // 750 TL ve üzeri siparişlerde kargo ücretsiz
  shippingFee: 65, // Standart -18°C strafor soğuk zincir kargo bedeli
  minOrderAmount: 200, // Minimum sipariş tutarı
  
  // Sosyal Medya
  social: {
    instagram: "https://instagram.com/nefismanticom",
    facebook: "https://facebook.com/nefismanticom",
    whatsapp: "https://wa.me/905073653937"
  }
};

