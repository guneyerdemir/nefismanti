/**
 * Nefis Mantı — Sipariş & Checkout Yöneticisi
 * Müşteri form doğrulaması, sipariş özeti ve PayTR / iyzico uyumlu genişletilebilir altyapı.
 */

const Checkout = {
  init() {
    this.setupListeners();
  },

  open() {
    if (Cart.items.length === 0) {
      Cart.showToast("Sepetiniz boş. Lütfen önce ürün ekleyiniz.", "warning");
      return;
    }
    Cart.closeDrawer();

    const modal = document.getElementById("checkoutModal");
    const backdrop = document.getElementById("checkoutBackdrop");
    if (modal) {
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
      this.renderSummary();
    }
    if (backdrop) backdrop.classList.add("active");
    document.body.classList.add("modal-open");
  },

  close() {
    const modal = document.getElementById("checkoutModal");
    const backdrop = document.getElementById("checkoutBackdrop");
    if (modal) {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
    }
    if (backdrop) backdrop.classList.remove("active");
    document.body.classList.remove("modal-open");
  },

  renderSummary() {
    const subtotal = Cart.getSubtotal();
    const shipping = Cart.getShippingFee();
    const total = Cart.getTotal();

    const summaryEl = document.getElementById("checkoutOrderSummaryList");
    if (summaryEl) {
      summaryEl.innerHTML = Cart.items.map(item => {
        const prod = Cart.getProduct(item.id);
        if (!prod) return "";
        return `
          <div class="checkout-summary-row">
            <span>${item.quantity}x ${prod.name} <small class="text-muted">(${prod.netWeight})</small></span>
            <span class="font-bold">${Cart.formatMoney(prod.price * item.quantity)}</span>
          </div>
        `;
      }).join("") + `
        <div class="checkout-summary-sub">
          <div class="checkout-summary-row">
            <span>Ara Toplam:</span>
            <span>${Cart.formatMoney(subtotal)}</span>
          </div>
          <div class="checkout-summary-row">
            <span>Soğuk Zincir Kargo:</span>
            <span>${shipping === 0 ? '<span class="text-success font-bold">Ücretsiz Kargo</span>' : Cart.formatMoney(shipping)}</span>
          </div>
          <div class="checkout-summary-row checkout-total-row">
            <strong>Ödenecek Tutar:</strong>
            <strong class="text-primary">${Cart.formatMoney(total)}</strong>
          </div>
        </div>
      `;
    }
  },

  setupListeners() {
    const form = document.getElementById("checkoutForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.processOrder(form);
      });
    }

    const backdrop = document.getElementById("checkoutBackdrop");
    if (backdrop) {
      backdrop.addEventListener("click", () => this.close());
    }
  },

  processOrder(form) {
    const formData = new FormData(form);
    const customer = {
      name: formData.get("fullname")?.toString().trim(),
      phone: formData.get("phone")?.toString().trim(),
      email: formData.get("email")?.toString().trim() || "",
      city: formData.get("city")?.toString().trim(),
      district: formData.get("district")?.toString().trim(),
      address: formData.get("address")?.toString().trim(),
      note: formData.get("note")?.toString().trim() || "",
      paymentMethod: formData.get("paymentMethod")?.toString() || "whatsapp"
    };

    // Temel Doğrulama
    if (!customer.name || customer.name.length < 3) {
      Cart.showToast("Lütfen geçerli bir ad ve soyad giriniz.", "warning");
      return;
    }
    if (!customer.phone || customer.phone.length < 10) {
      Cart.showToast("Lütfen geçerli bir telefon numarası giriniz.", "warning");
      return;
    }
    if (!customer.city || !customer.address) {
      Cart.showToast("Lütfen teslimat ili ve açık adresinizi belirtiniz.", "warning");
      return;
    }

    // Sipariş Kod Üretimi (Referans Amaçlı)
    const orderNo = "NM-" + Math.floor(100000 + Math.random() * 900000);
    const orderData = {
      orderNo,
      date: new Date().toISOString(),
      customer,
      items: [...Cart.items],
      subtotal: Cart.getSubtotal(),
      shippingFee: Cart.getShippingFee(),
      total: Cart.getTotal()
    };

    console.log("Sipariş Bilgisi Kaydedildi (Geliştirilebilir Backend Uyumlu):", orderData);

    // Eğer WhatsApp ile tamamlama seçilmişse veya hızlı iletişim isteniyorsa:
    if (customer.paymentMethod === "whatsapp" || customer.paymentMethod === "kapida" || customer.paymentMethod === "havale") {
      this.showSuccessView(orderData);
    } else if (customer.paymentMethod === "online_credit_card") {
      // Backend PayTR / iyzico entegrasyon bilgilendirmesi
      this.showSuccessView(orderData, "online_card");
    }
  },

  showSuccessView(orderData, mode = "standard") {
    const formView = document.getElementById("checkoutFormView");
    const successView = document.getElementById("checkoutSuccessView");
    
    if (formView && successView) {
      formView.style.display = "none";
      successView.style.display = "block";

      const orderNoEl = document.getElementById("successOrderNo");
      const orderTotalEl = document.getElementById("successOrderTotal");
      const orderDetailsEl = document.getElementById("successOrderCustomer");

      if (orderNoEl) orderNoEl.textContent = orderData.orderNo;
      if (orderTotalEl) orderTotalEl.textContent = Cart.formatMoney(orderData.total);
      if (orderDetailsEl) {
        orderDetailsEl.innerHTML = `
          <strong>Müşteri:</strong> ${orderData.customer.name}<br>
          <strong>Telefon:</strong> ${orderData.customer.phone}<br>
          <strong>Adres:</strong> ${orderData.customer.district ? orderData.customer.district + ', ' : ''}${orderData.customer.city}<br>
          <strong>Ödeme Tercihi:</strong> ${this.getPaymentMethodLabel(orderData.customer.paymentMethod)}
        `;
      }

      // WhatsApp butonuna sipariş numarasını da ekle
      const waBtn = document.getElementById("successWhatsAppBtn");
      if (waBtn) {
        waBtn.onclick = () => {
          Cart.sendCartToWhatsApp({
            ...orderData.customer,
            name: `[Sipariş No: ${orderData.orderNo}] ${orderData.customer.name}`
          });
          Cart.clear();
        };
      }

      // Sepeti temizle
      Cart.clear();
      Cart.showToast(`Siparişiniz (${orderData.orderNo}) oluşturuldu!`, "success");
    }
  },

  getPaymentMethodLabel(method) {
    switch (method) {
      case "whatsapp": return "WhatsApp ile Doğrudan Teyit & Sipariş";
      case "kapida": return "Kapıda Nakit / Kredi Kartı";
      case "havale": return "Banka Havalesi / FAST";
      case "online_credit_card": return "Online Kart (Ön Onaylı Güvenli İletişim)";
      default: return method;
    }
  },

  resetModal() {
    const formView = document.getElementById("checkoutFormView");
    const successView = document.getElementById("checkoutSuccessView");
    const form = document.getElementById("checkoutForm");
    
    if (formView) formView.style.display = "block";
    if (successView) successView.style.display = "none";
    if (form) form.reset();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  Checkout.init();
});

