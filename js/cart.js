/**
 * Nefis Mantı — Sepet ve Sipariş Motoru
 * LocalStorage tabanlı modüler sepet, WhatsApp sipariş entegrasyonu ve checkout altyapısı.
 */

const Cart = {
  STORAGE_KEY: "nefismanti_cart_v1",
  items: [],

  init() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      this.items = stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn("LocalStorage erişim hatası, geçici sepet kullanılıyor:", e);
      this.items = [];
    }
    this.render();
    this.setupListeners();
  },

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
    } catch (e) {
      console.warn("Sepet kaydedilemedi:", e);
    }
    this.render();
  },

  addItem(productId, quantity = 1) {
    const qty = parseInt(quantity, 10) || 1;
    const existing = this.items.find(item => item.id === productId);
    
    if (existing) {
      existing.quantity += qty;
    } else {
      const product = PRODUCTS.find(p => p.id === productId);
      if (!product) return;
      this.items.push({
        id: productId,
        quantity: qty
      });
    }

    this.save();
    this.showToast(`"${this.getProduct(productId)?.name}" sepete eklendi!`, "success");
    this.openDrawer();
  },

  removeItem(productId) {
    const prod = this.getProduct(productId);
    this.items = this.items.filter(item => item.id !== productId);
    this.save();
    if (prod) {
      this.showToast(`"${prod.name}" sepetten çıkarıldı.`, "info");
    }
  },

  updateQuantity(productId, delta) {
    const item = this.items.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(productId);
    } else {
      this.save();
    }
  },

  clear() {
    this.items = [];
    this.save();
  },

  getProduct(productId) {
    return PRODUCTS.find(p => p.id === productId);
  },

  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal() {
    return this.items.reduce((sum, item) => {
      const prod = this.getProduct(item.id);
      return sum + (prod ? prod.price * item.quantity : 0);
    }, 0);
  },

  getShippingFee() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= SITE_CONFIG.freeShippingThreshold ? 0 : SITE_CONFIG.shippingFee;
  },

  getTotal() {
    return this.getSubtotal() + this.getShippingFee();
  },

  formatMoney(amount) {
    return amount.toLocaleString("tr-TR") + " " + SITE_CONFIG.currency;
  },

  // UI Güncelleme Metodu
  render() {
    const count = this.getItemCount();
    const subtotal = this.getSubtotal();
    const shipping = this.getShippingFee();
    const total = this.getTotal();

    // Sepet Sayacı Rozetleri
    document.querySelectorAll(".cart-badge-count").forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? "inline-flex" : "none";
    });

    // Ara Toplam / Toplam
    document.querySelectorAll(".cart-subtotal-val").forEach(el => el.textContent = this.formatMoney(subtotal));
    document.querySelectorAll(".cart-total-val").forEach(el => el.textContent = this.formatMoney(total));
    
    // Kargo Tutarı
    document.querySelectorAll(".cart-shipping-val").forEach(el => {
      if (subtotal === 0) {
        el.textContent = "—";
      } else if (shipping === 0) {
        el.innerHTML = '<span class="text-success font-bold">Ücretsiz Kargo</span>';
      } else {
        el.textContent = this.formatMoney(shipping);
      }
    });

    // Ücretsiz Kargo İlerleme Çubuğu
    const remaining = Math.max(0, SITE_CONFIG.freeShippingThreshold - subtotal);
    const progressPercent = Math.min(100, Math.round((subtotal / SITE_CONFIG.freeShippingThreshold) * 100));
    
    const shippingMsg = document.getElementById("freeShippingMsg");
    const shippingBar = document.getElementById("freeShippingProgressBar");
    
    if (shippingMsg && shippingBar) {
      if (subtotal === 0) {
        shippingMsg.innerHTML = `<strong>${this.formatMoney(SITE_CONFIG.freeShippingThreshold)}</strong> üzeri siparişlerde kargo <strong>ücretsiz!</strong>`;
        shippingBar.style.width = "0%";
      } else if (remaining === 0) {
        shippingMsg.innerHTML = `🎉 Tebrikler! <strong>Kargonuz ÜCRETSİZ!</strong>`;
        shippingBar.style.width = "100%";
      } else {
        shippingMsg.innerHTML = `Ücretsiz kargoya son <strong>${this.formatMoney(remaining)}</strong>!`;
        shippingBar.style.width = `${progressPercent}%`;
      }
    }

    // Sepet Liste Öğeleri
    const container = document.getElementById("cartItemsList");
    const emptyState = document.getElementById("cartEmptyState");
    const footer = document.getElementById("cartDrawerFooter");

    if (container) {
      if (this.items.length === 0) {
        container.innerHTML = "";
        if (emptyState) emptyState.style.display = "block";
        if (footer) footer.style.display = "none";
      } else {
        if (emptyState) emptyState.style.display = "none";
        if (footer) footer.style.display = "block";

        container.innerHTML = this.items.map(item => {
          const prod = this.getProduct(item.id);
          if (!prod) return "";
          const itemTotal = prod.price * item.quantity;

          return `
            <div class="cart-item" data-id="${prod.id}">
              <img src="${prod.image}" alt="${prod.name}" class="cart-item-img" loading="lazy">
              <div class="cart-item-info">
                <div class="cart-item-title">${prod.name}</div>
                <div class="cart-item-weight">${prod.netWeight} · ${this.formatMoney(prod.price)} / paket</div>
                <div class="cart-item-actions">
                  <div class="qty-stepper">
                    <button type="button" class="qty-btn" onclick="Cart.updateQuantity('${prod.id}', -1)" aria-label="Azalt">−</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button type="button" class="qty-btn" onclick="Cart.updateQuantity('${prod.id}', 1)" aria-label="Artır">+</button>
                  </div>
                  <span class="cart-item-total font-bold">${this.formatMoney(itemTotal)}</span>
                </div>
              </div>
              <button type="button" class="cart-item-remove" onclick="Cart.removeItem('${prod.id}')" aria-label="Ürünü kaldır" title="Kaldır">×</button>
            </div>
          `;
        }).join("");
      }
    }
  },

  // Çekmece Kontrolleri
  openDrawer() {
    const drawer = document.getElementById("cartDrawer");
    const backdrop = document.getElementById("cartBackdrop");
    if (drawer) {
      drawer.classList.add("active");
      drawer.setAttribute("aria-hidden", "false");
    }
    if (backdrop) backdrop.classList.add("active");
    document.body.classList.add("modal-open");
  },

  closeDrawer() {
    const drawer = document.getElementById("cartDrawer");
    const backdrop = document.getElementById("cartBackdrop");
    if (drawer) {
      drawer.classList.remove("active");
      drawer.setAttribute("aria-hidden", "true");
    }
    if (backdrop) backdrop.classList.remove("active");
    document.body.classList.remove("modal-open");
  },

  setupListeners() {
    // Backdrop tıklaması ile sepeti kapatma
    const backdrop = document.getElementById("cartBackdrop");
    if (backdrop) {
      backdrop.addEventListener("click", () => this.closeDrawer());
    }

    // ESC tuşu ile kapatma
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeDrawer();
        ProductModal.close();
        CheckoutModal.close();
      }
    });
  },

  // WhatsApp Sipariş Entegrasyonu (Sepetteki Ürünleri Dökümlü Mesaja Çevirme)
  sendCartToWhatsApp(customer = {}) {
    if (this.items.length === 0) {
      this.showToast("Sepetinizde ürün bulunmuyor.", "warning");
      return;
    }

    let text = `*🥟 NEFİS MANTI — ONLINE SİPARİŞ FORMU*\n`;
    text += `Web Sitesi: ${SITE_CONFIG.domain}\n`;
    text += `Tarih: ${new Date().toLocaleDateString('tr-TR')}\n`;
    text += `------------------------------------\n`;

    if (customer.name) {
      text += `*Müşteri:* ${customer.name}\n`;
      text += `*Telefon:* ${customer.phone || 'Belirtilmedi'}\n`;
      if (customer.city) text += `*İl/İlçe:* ${customer.district ? customer.district + ' / ' : ''}${customer.city}\n`;
      if (customer.address) text += `*Adres:* ${customer.address}\n`;
      if (customer.note) text += `*Sipariş Notu:* ${customer.note}\n`;
      text += `------------------------------------\n`;
    }

    text += `*SİPARİŞ VERİLEN ÜRÜNLER:*\n`;
    this.items.forEach((item, index) => {
      const prod = this.getProduct(item.id);
      if (prod) {
        const itemTot = prod.price * item.quantity;
        text += `${index + 1}. ${prod.name} (${prod.netWeight})\n`;
        text += `   ↳ ${item.quantity} Adet × ${this.formatMoney(prod.price)} = *${this.formatMoney(itemTot)}*\n`;
      }
    });

    const subtotal = this.getSubtotal();
    const shipping = this.getShippingFee();
    const total = this.getTotal();

    text += `------------------------------------\n`;
    text += `*Ara Toplam:* ${this.formatMoney(subtotal)}\n`;
    text += `*Soğuk Zincir Kargo:* ${shipping === 0 ? 'ÜCRETSİZ' : this.formatMoney(shipping)}\n`;
    text += `*GENEL TOPLAM:* *${this.formatMoney(total)}*\n`;
    text += `------------------------------------\n`;
    text += `📦 *Teslimat Notu:* Ürünlerin strafor kutu ve buz akülü soğuk zincir ambalajında gönderilmesini rica ederim. Siparişimi teyit eder misiniz?`;

    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encoded}`;
    window.open(url, "_blank");
  },

  // Tekil Ürün İçin Doğrudan WhatsApp Sipariş Butonu
  sendSingleProductToWhatsApp(productId, qty = 1) {
    const prod = this.getProduct(productId);
    if (!prod) return;

    const count = parseInt(qty, 10) || 1;
    const total = prod.price * count;

    let text = `*🥟 NEFİS MANTI — HIZLI ÜRÜN SİPARİŞİ*\n`;
    text += `Merhaba, web sitenizden aşağıdaki ürün hakkında sipariş vermek istiyorum:\n\n`;
    text += `• *Ürün:* ${prod.name}\n`;
    text += `• *Paket Gramajı:* ${prod.netWeight}\n`;
    text += `• *Adet:* ${count} Adet\n`;
    text += `• *Tahmini Tutar:* ${this.formatMoney(total)}\n\n`;
    text += `Adresime soğuk zincir teslimatı ve ödeme süreci hakkında bilgi verebilir misiniz?`;

    const url = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  },

  // Toast Bildirim Sistemi
  showToast(message, type = "info") {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast-msg toast-${type}`;
    toast.setAttribute("role", "status");
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : type === 'warning' ? '⚠' : 'ℹ'}</span>
      <span class="toast-text">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("visible");
    }, 10);

    setTimeout(() => {
      toast.classList.remove("visible");
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

// Sayfa yüklendiğinde sepeti başlat
document.addEventListener("DOMContentLoaded", () => {
  Cart.init();
});

