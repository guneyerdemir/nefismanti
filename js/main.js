/**
 * Nefis Mantı — Ana Arayüz ve Etkileşim Betiği
 * Modern-geleneksel UI, erişilebilir modal/akordeon, filtreleme ve ürün kataloğu.
 */

// 1. Ürün Kataloğu Render & Filtreleme
const Catalog = {
  currentFilter: "all",

  init() {
    this.renderProducts();
    this.setupFilters();
  },

  setupFilters() {
    const tabs = document.querySelectorAll(".catalog-tab-btn");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        this.currentFilter = tab.dataset.filter || "all";
        this.renderProducts();
      });
    });
  },

  renderProducts() {
    const grid = document.getElementById("catalogProductGrid");
    if (!grid) return;

    const filtered = this.currentFilter === "all"
      ? PRODUCTS
      : PRODUCTS.filter(p => p.category === this.currentFilter);

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="empty-filter-msg">Bu kategoride henüz ürün bulunmuyor.</div>`;
      return;
    }

    grid.innerHTML = filtered.map(p => {
      const badgeHtml = p.badge 
        ? `<span class="product-badge badge-${p.badgeType || 'primary'}">${p.badge}</span>` 
        : "";

      return `
        <article class="product-card" data-id="${p.id}">
          <div class="product-card-visual" onclick="ProductModal.open('${p.id}')">
            ${badgeHtml}
            <img src="${p.image}" alt="${p.name}" class="product-card-img" loading="lazy">
            <div class="product-quick-view-overlay">
              <span class="btn btn-sm btn-light">Detaylı İncele 🔍</span>
            </div>
          </div>
          <div class="product-card-body">
            <div class="product-card-meta">
              <span class="product-card-weight">⚖ ${p.netWeight}</span>
              <span class="product-card-portion">👥 ${p.portion}</span>
            </div>
            <h3 class="product-card-title">
              <a href="javascript:void(0)" onclick="ProductModal.open('${p.id}')">${p.name}</a>
            </h3>
            <p class="product-card-desc">${p.shortDesc}</p>
            <div class="product-card-foot">
              <div class="product-price-box">
                <span class="product-price-label">Fiyat</span>
                <span class="product-price-val">${Cart.formatMoney(p.price)}</span>
              </div>
              <div class="product-actions-btn-group">
                <button type="button" class="btn btn-primary btn-sm add-cart-btn" onclick="Cart.addItem('${p.id}', 1)">
                  <span>Sepete Ekle</span>
                  <span class="btn-icon">🛒</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }
};

// 2. Ürün Detay & Hızlı İnceleme Modalı
const ProductModal = {
  currentProduct: null,
  currentQty: 1,

  init() {
    const backdrop = document.getElementById("productModalBackdrop");
    if (backdrop) {
      backdrop.addEventListener("click", () => this.close());
    }
  },

  open(productId) {
    const prod = PRODUCTS.find(p => p.id === productId);
    if (!prod) return;

    this.currentProduct = prod;
    this.currentQty = 1;

    // Alanları Doldur
    const modal = document.getElementById("productDetailModal");
    const backdrop = document.getElementById("productModalBackdrop");

    document.getElementById("modalProdImg").src = prod.image;
    document.getElementById("modalProdImg").alt = prod.name;
    document.getElementById("modalProdName").textContent = prod.name;
    document.getElementById("modalProdWeight").textContent = prod.netWeight;
    document.getElementById("modalProdPortion").textContent = prod.portion;
    document.getElementById("modalProdPrice").textContent = Cart.formatMoney(prod.price);
    document.getElementById("modalProdDesc").textContent = prod.description;
    document.getElementById("modalProdIngredients").textContent = prod.ingredients;
    document.getElementById("modalProdAllergens").textContent = prod.allergens;
    document.getElementById("modalProdStorage").textContent = prod.storage;
    document.getElementById("modalProdCooking").textContent = prod.cooking;
    document.getElementById("modalQtyVal").textContent = "1";

    // Tabları Sıfırla (Genel Tabı Aktif)
    this.switchTab("general");

    if (modal) {
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
    }
    if (backdrop) backdrop.classList.add("active");
    document.body.classList.add("modal-open");
  },

  close() {
    const modal = document.getElementById("productDetailModal");
    const backdrop = document.getElementById("productModalBackdrop");
    if (modal) {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
    }
    if (backdrop) backdrop.classList.remove("active");
    document.body.classList.remove("modal-open");
  },

  updateQty(delta) {
    this.currentQty = Math.max(1, this.currentQty + delta);
    document.getElementById("modalQtyVal").textContent = this.currentQty;
  },

  addToCartFromModal() {
    if (!this.currentProduct) return;
    Cart.addItem(this.currentProduct.id, this.currentQty);
    this.close();
  },

  orderWhatsAppFromModal() {
    if (!this.currentProduct) return;
    Cart.sendSingleProductToWhatsApp(this.currentProduct.id, this.currentQty);
  },

  switchTab(tabName) {
    const tabs = document.querySelectorAll(".modal-tab-nav button");
    const panels = document.querySelectorAll(".modal-tab-panel");

    tabs.forEach(t => {
      if (t.dataset.tab === tabName) {
        t.classList.add("active");
      } else {
        t.classList.remove("active");
      }
    });

    panels.forEach(p => {
      if (p.id === `tabPanel-${tabName}`) {
        p.style.display = "block";
      } else {
        p.style.display = "none";
      }
    });
  }
};

// 3. Mobil Navigasyon & Menü Çekmecesi
const MobileNav = {
  init() {
    const toggle = document.getElementById("menuToggle");
    const menu = document.getElementById("mobileMenuDrawer");
    const backdrop = document.getElementById("mobileMenuBackdrop");

    if (toggle && menu) {
      toggle.addEventListener("click", () => {
        const isOpen = menu.classList.toggle("active");
        toggle.setAttribute("aria-expanded", String(isOpen));
        if (backdrop) backdrop.classList.toggle("active", isOpen);
        document.body.classList.toggle("modal-open", isOpen);
      });
    }

    if (backdrop) {
      backdrop.addEventListener("click", () => this.close());
    }

    // Menü içindeki linke tıklandığında menüyü kapat
    if (menu) {
      menu.querySelectorAll("a").forEach(a => {
        a.addEventListener("click", () => this.close());
      });
    }
  },

  close() {
    const toggle = document.getElementById("menuToggle");
    const menu = document.getElementById("mobileMenuDrawer");
    const backdrop = document.getElementById("mobileMenuBackdrop");

    if (menu) menu.classList.remove("active");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    if (backdrop) backdrop.classList.remove("active");
    document.body.classList.remove("modal-open");
  }
};

// 4. Sıkça Sorulan Sorular (FAQ) Akordeon
const FAQ = {
  init() {
    const items = document.querySelectorAll(".faq-item");
    items.forEach(item => {
      const header = item.querySelector(".faq-question");
      if (header) {
        header.addEventListener("click", () => {
          const isActive = item.classList.contains("active");
          // Tekil açılma için diğerlerini kapat
          items.forEach(i => {
            i.classList.remove("active");
            i.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
          });

          if (!isActive) {
            item.classList.add("active");
            header.setAttribute("aria-expanded", "true");
          }
        });
      }
    });
  }
};

// 5. İletişim & Toptan Talep Formu (WhatsApp Yönlendirmeli)
const Contact = {
  init() {
    const form = document.getElementById("leadForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const msg = document.getElementById("formMsg");
        const btn = form.querySelector('button[type="submit"]');

        const name = form.querySelector("#name")?.value.trim();
        const phone = form.querySelector("#phone")?.value.trim();
        const business = form.querySelector("#business")?.value.trim() || "";
        const channelSelect = form.querySelector("#channel");
        const channelText = channelSelect ? channelSelect.options[channelSelect.selectedIndex].text : "Genel Bilgi";
        const message = form.querySelector("#message")?.value.trim() || "";

        if (!name || !phone) {
          if (msg) {
            msg.innerHTML = '<span class="text-error">Lütfen adınızı ve telefon numaranızı eksiksiz giriniz.</span>';
          }
          return;
        }

        if (btn) btn.disabled = true;
        if (msg) {
          msg.innerHTML = '<span>Talebiniz hazırlanıyor ve WhatsApp hattımıza aktarılıyor...</span>';
        }

        // WhatsApp Mesaj Şablonu Oluşturma
        let waText = `*🥟 NEFİS MANTI — YENİ İLETİŞİM & TOPTAN TALEP*\n`;
        waText += `------------------------------------\n`;
        waText += `*Ad Soyad:* ${name}\n`;
        waText += `*Telefon:* ${phone}\n`;
        if (business) waText += `*İşletme / Kurum:* ${business}\n`;
        waText += `*Talep Türü:* ${channelText}\n`;
        if (message) waText += `*Mesaj / İhtiyaç:* ${message}\n`;
        waText += `------------------------------------\n`;
        waText += `Web sitesi (nefismanti.com) iletişim formundan gönderildi.`;

        const waUrl = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(waText)}`;

        setTimeout(() => {
          if (msg) {
            msg.innerHTML = '<span class="text-success">✓ Talebiniz WhatsApp hattımıza iletiliyor! Satış ekibimiz hemen dönüş yapacaktır.</span>';
          }
          window.open(waUrl, "_blank");
          form.reset();
          if (btn) btn.disabled = false;
        }, 500);
      });
    }
  }
};

// 6. Çerez İzin Bildirimi ve KVKK Modalı
const Legal = {
  COOKIE_KEY: "nefismanti_cookies_accepted",

  init() {
    this.checkCookieBanner();
  },

  checkCookieBanner() {
    const banner = document.getElementById("cookieBanner");
    if (!banner) return;

    try {
      if (!localStorage.getItem(this.COOKIE_KEY)) {
        setTimeout(() => {
          banner.classList.add("visible");
        }, 1200);
      }
    } catch (e) {
      banner.classList.add("visible");
    }
  },

  acceptCookies() {
    const banner = document.getElementById("cookieBanner");
    if (banner) banner.classList.remove("visible");
    try {
      localStorage.setItem(this.COOKIE_KEY, "true");
    } catch (e) {}
  },

  openKvkkModal() {
    const modal = document.getElementById("kvkkModal");
    const backdrop = document.getElementById("legalBackdrop");
    if (modal) modal.classList.add("active");
    if (backdrop) backdrop.classList.add("active");
    document.body.classList.add("modal-open");
  },

  closeKvkkModal() {
    const modal = document.getElementById("kvkkModal");
    const backdrop = document.getElementById("legalBackdrop");
    if (modal) modal.classList.remove("active");
    if (backdrop) backdrop.classList.remove("active");
    document.body.classList.remove("modal-open");
  }
};

// Tüm modülleri DOM hazır olduğunda başlat
document.addEventListener("DOMContentLoaded", () => {
  Catalog.init();
  ProductModal.init();
  MobileNav.init();
  FAQ.init();
  Contact.init();
  Legal.init();

  // Dinamik site bilgileri enjeksiyonu
  document.querySelectorAll(".site-phone").forEach(el => el.textContent = SITE_CONFIG.phoneDisplay);
  document.querySelectorAll(".site-phone-link").forEach(el => el.href = `tel:${SITE_CONFIG.phone}`);
  document.querySelectorAll(".site-email").forEach(el => el.textContent = SITE_CONFIG.email);
  document.querySelectorAll(".site-address").forEach(el => el.textContent = SITE_CONFIG.address);
  document.querySelectorAll(".site-whatsapp-btn").forEach(el => {
    el.href = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent("Merhaba Nefis Mantı, ürünleriniz ve sipariş süreçleriniz hakkında bilgi almak istiyorum.")}`;
  });
});

