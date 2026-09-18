/**
 * MINIKIN STUDIO — Reactive Store State & WooCommerce Headless Client
 */

const WC_API_CONFIG = {
  catalogEndpoint: 'http://72.61.254.137:8085/wp-json/minikin/v1/catalog',
  checkoutBase: 'http://72.61.254.137:8085/checkout/',
  freeShippingThreshold: 75.0,
};

// Fallback Curated Catalog (Instant availability even if offline or network delay)
const FALLBACK_PRODUCTS = [
  {
    id: 11,
    name: 'The Bauhaus Modular Wooden Castle',
    price: 89.00,
    regular_price: 99.00,
    description: '54 precision-milled organic beechwood blocks inspired by modern architectural forms. Finished with food-grade beeswax and cold-pressed walnut oil.',
    short_description: 'Architectural beechwood construction set for open-ended spatial discovery.',
    category: 'Architecture',
    age: '3 – 5 Years',
    tag: 'Bestseller',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1000&q=85',
    stock_status: 'instock'
  },
  {
    id: 12,
    name: 'Nordic Beech Rainbow Stacker',
    price: 48.00,
    regular_price: 48.00,
    description: '10 nested arches crafted from a single piece of FSC-certified European beechwood with water-based non-toxic mineral dyes.',
    short_description: 'Classic Montessori arch stacker promoting spatial depth and balance.',
    category: 'Montessori',
    age: '1 – 3 Years',
    tag: 'Staff Pick',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1000&q=85',
    stock_status: 'instock'
  },
  {
    id: 13,
    name: 'Geometric Sensory Balance Stones',
    price: 54.00,
    regular_price: 62.00,
    description: 'Set of 16 faceted balance rocks designed to train fine motor dexterity, patience, and tactile focus in calm Scandinavian tones.',
    short_description: 'Faceted sensory balancing rocks in earthy muted tones.',
    category: 'Montessori',
    age: '1 – 3 Years',
    tag: 'Montessori Choice',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1000&q=85',
    stock_status: 'instock'
  },
  {
    id: 14,
    name: 'Kinetic Wooden Wobble Tumbler',
    price: 36.00,
    regular_price: 36.00,
    description: 'Weighted pendulum roly-poly toy with gentle acoustic chime bell inside. Solid organic maple wood.',
    short_description: 'Weighted roly-poly acoustic chime for infant tactile discovery.',
    category: 'Sensory',
    age: '0 – 12 Months',
    tag: 'New Release',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=1000&q=85',
    stock_status: 'instock'
  },
  {
    id: 15,
    name: 'Mechanical Planetarium Orbital Clock',
    price: 115.00,
    regular_price: 130.00,
    description: 'Intricate laser-cut interlocking birch plywood planetary model with real brass gear escapements and manual crank.',
    short_description: 'Engineering curiosity meets astronomical exploration for young builders.',
    category: 'Puzzles & Logic',
    age: '5+ Years',
    tag: 'Collector Item',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d?auto=format&fit=crop&w=1000&q=85',
    stock_status: 'instock'
  },
  {
    id: 16,
    name: 'Organic French Linen Bunny',
    price: 42.00,
    regular_price: 42.00,
    description: 'Stitched from 100% stonewashed French linen and stuffed with hypoallergenic organic kapok fibers. Plastic-free.',
    short_description: 'Heirloom comfort companion with hand-embroidered sleepy face.',
    category: 'Soft Companions',
    age: '0 – 12 Months',
    tag: 'Baby Essential',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=1000&q=85',
    stock_status: 'instock'
  },
  {
    id: 17,
    name: 'Minimalist Walnut & Brass Abacus',
    price: 62.00,
    regular_price: 70.00,
    description: 'Solid American walnut frame with satin-finish brass tracks and hand-turned beech beads for tactile arithmetic.',
    short_description: 'Sculptural desk abacus blending Danish modern aesthetic with intuitive math.',
    category: 'Montessori',
    age: '3 – 5 Years',
    tag: 'Design Award',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1000&q=85',
    stock_status: 'instock'
  },
  {
    id: 18,
    name: 'Articulated Pull-Along Dachshund',
    price: 44.00,
    regular_price: 44.00,
    description: 'Articulated wooden body with rubber-lined whisper-quiet wheels and organic braided cotton pull rope.',
    short_description: 'Playful kinetic companion encouraging first steps and gross motor skills.',
    category: 'Sensory',
    age: '1 – 3 Years',
    tag: 'Classic',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=85',
    stock_status: 'instock'
  }
];

class StoreManager {
  constructor() {
    this.products = [...FALLBACK_PRODUCTS];
    this.cart = this.loadCart();
    this.activeFilter = 'all';
    this.activeSort = 'featured';
    this.currency = 'USD';
    this.rates = { USD: 1.0, EUR: 0.92, GBP: 0.78 };
    this.symbols = { USD: '$', EUR: '€', GBP: '£' };

    this.init();
  }

  async init() {
    await this.fetchProductsFromWooCommerce();
    this.renderCatalog();
    this.updateCartUI();
    this.setupEventListeners();
  }

  // =========================================================================
  // WooCommerce REST API Integration
  // =========================================================================
  async fetchProductsFromWooCommerce() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(WC_API_CONFIG.catalogEndpoint, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const liveProducts = await res.json();
        if (Array.isArray(liveProducts) && liveProducts.length > 0) {
          this.products = liveProducts;
          console.log(`[WooCommerce] Successfully loaded ${liveProducts.length} live products from VPS!`);
        }
      }
    } catch (err) {
      console.warn('[WooCommerce] Using built-in high-performance product fallback:', err.message);
    }
  }

  // =========================================================================
  // Cart Management & Persistence
  // =========================================================================
  loadCart() {
    try {
      const saved = localStorage.getItem('minikin_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  saveCart() {
    localStorage.setItem('minikin_cart', JSON.stringify(this.cart));
  }

  addToCart(productId, quantity = 1, event = null) {
    const product = this.products.find(p => p.id === productId) || FALLBACK_PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existing = this.cart.find(item => item.id === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity: quantity,
      });
    }

    this.saveCart();
    this.updateCartUI();

    // Trigger sound & celebration
    if (window.MinikinAudio) {
      window.MinikinAudio.celebrateAdd();
    }

    if (event && window.triggerCelebration) {
      window.triggerCelebration(event.clientX, event.clientY);
    }

    // Open Cart Drawer
    this.openCart();
  }

  updateQuantity(productId, delta) {
    const itemIndex = this.cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
      this.cart[itemIndex].quantity += delta;
      if (this.cart[itemIndex].quantity <= 0) {
        this.cart.splice(itemIndex, 1);
        if (window.MinikinAudio) window.MinikinAudio.removeNote();
      } else {
        if (window.MinikinAudio) window.MinikinAudio.woodClick();
      }
      this.saveCart();
      this.updateCartUI();
    }
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
    this.updateCartUI();
    if (window.MinikinAudio) window.MinikinAudio.removeNote();
  }

  getCartSubtotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getCartCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  // =========================================================================
  // Formatting & Currencies
  // =========================================================================
  formatPrice(amountUSD) {
    const rate = this.rates[this.currency] || 1.0;
    const symbol = this.symbols[this.currency] || '$';
    const converted = amountUSD * rate;
    return `${symbol}${converted.toFixed(2)}`;
  }

  // =========================================================================
  // UI Rendering & Updates
  // =========================================================================
  renderCatalog() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    let filtered = [...this.products];

    // Filter
    if (this.activeFilter !== 'all') {
      filtered = filtered.filter(p => {
        const ageMatch = p.age.toLowerCase().includes(this.activeFilter.toLowerCase());
        const catMatch = p.category.toLowerCase().includes(this.activeFilter.toLowerCase());
        return ageMatch || catMatch;
      });
    }

    // Sort
    if (this.activeSort === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (this.activeSort === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (this.activeSort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    // Update count display
    const countDisplay = document.getElementById('catalog-count');
    if (countDisplay) {
      countDisplay.textContent = `Showing ${filtered.length} Objects`;
    }

    grid.innerHTML = filtered.map(product => `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-image-box">
          <span class="product-badge ${product.tag.includes('Bestseller') ? 'badge-bestseller' : product.tag.includes('New') ? 'badge-new' : 'badge-montessori'}">
            ${product.tag}
          </span>
          <img class="product-img" src="${product.image}" alt="${product.name}" loading="lazy">
          <div class="card-action-overlay">
            <button class="btn-quick-view" onclick="window.MinikinStore.openQuickView(${product.id})">
              Quick View
            </button>
            <button class="btn-add-quick" aria-label="Add to Cart" onclick="window.MinikinStore.addToCart(${product.id}, 1, event)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>

        <div class="product-content">
          <span class="product-age-tag">${product.age} · ${product.category}</span>
          <h3 class="product-title">${product.name}</h3>
          <p class="product-specs">
            <span>🌿 100% Solid Beech</span>
            <span>•</span>
            <span>Non-Toxic</span>
          </p>
          <div class="product-footer">
            <span class="product-price">${this.formatPrice(product.price)}</span>
            <div class="product-rating">
              <span class="star">★</span>
              <span>${product.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </article>
    `).join('');
  }

  updateCartUI() {
    const badge = document.getElementById('cart-badge');
    const itemsContainer = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const progressTrack = document.getElementById('shipping-progress');
    const meterText = document.getElementById('shipping-meter-text');

    const count = this.getCartCount();
    const subtotal = this.getCartSubtotal();

    // Badge
    if (badge) {
      badge.textContent = count;
      badge.classList.remove('bump');
      void badge.offsetWidth; // trigger reflow
      badge.classList.add('bump');
    }

    // Shipping Meter
    if (progressTrack && meterText) {
      const remaining = WC_API_CONFIG.freeShippingThreshold - subtotal;
      const pct = Math.min(100, Math.round((subtotal / WC_API_CONFIG.freeShippingThreshold) * 100));
      progressTrack.style.width = `${pct}%`;

      if (remaining <= 0) {
        meterText.innerHTML = `<span>🎉 You unlocked <strong>Free Worldwide Shipping!</strong></span>`;
      } else {
        meterText.innerHTML = `<span>Add <strong>${this.formatPrice(remaining)}</strong> more for Free Shipping</span><span>${pct}%</span>`;
      }
    }

    // Subtotal & Total
    if (subtotalEl) subtotalEl.textContent = this.formatPrice(subtotal);
    if (totalEl) totalEl.textContent = this.formatPrice(subtotal);

    // Items List
    if (itemsContainer) {
      if (this.cart.length === 0) {
        itemsContainer.innerHTML = `
          <div class="cart-empty-state">
            <div class="empty-icon">🧸</div>
            <h4 class="empty-title">Your Play Bag is Empty</h4>
            <p class="empty-subtitle">Discover our heirloom wooden architectures and sensory tools.</p>
            <button class="btn btn-primary" onclick="window.MinikinStore.closeCart()">Explore Collection</button>
          </div>
        `;
      } else {
        itemsContainer.innerHTML = this.cart.map(item => `
          <div class="cart-item">
            <img class="cart-item-img" src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
              <h4 class="cart-item-name">${item.name}</h4>
              <span class="cart-item-meta">${item.category}</span>
              <div class="cart-item-controls">
                <div class="qty-stepper">
                  <button class="qty-btn" onclick="window.MinikinStore.updateQuantity(${item.id}, -1)">−</button>
                  <span class="qty-val">${item.quantity}</span>
                  <button class="qty-btn" onclick="window.MinikinStore.updateQuantity(${item.id}, 1)">+</button>
                </div>
                <span class="cart-item-price">${this.formatPrice(item.price * item.quantity)}</span>
              </div>
            </div>
          </div>
        `).join('');
      }
    }
  }

  // =========================================================================
  // Quick View Modal
  // =========================================================================
  openQuickView(productId) {
    const product = this.products.find(p => p.id === productId) || FALLBACK_PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    if (window.MinikinAudio) window.MinikinAudio.woodClick();

    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalContent = document.getElementById('modal-content');
    if (!modalBackdrop || !modalContent) return;

    modalContent.innerHTML = `
      <div class="modal-gallery">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="modal-body">
        <span class="modal-category">${product.category} · ${product.age}</span>
        <h2 class="modal-title">${product.name}</h2>
        <div class="modal-price">${this.formatPrice(product.price)}</div>
        <p class="modal-desc">${product.description}</p>
        
        <div class="modal-badges-list">
          <span class="mini-badge">🪵 FSC European Beech</span>
          <span class="mini-badge">🌿 Organic Beeswax Finish</span>
          <span class="mini-badge">🛡️ EN-71 Child-Safe</span>
          <span class="mini-badge">✨ Open-Ended Play</span>
        </div>

        <div class="modal-cta-row">
          <button class="btn btn-primary" style="flex: 1;" onclick="window.MinikinStore.addToCart(${product.id}, 1, event); window.MinikinStore.closeQuickView();">
            Add to Bag · ${this.formatPrice(product.price)}
          </button>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('open');
  }

  closeQuickView() {
    const modalBackdrop = document.getElementById('modal-backdrop');
    if (modalBackdrop) modalBackdrop.classList.remove('open');
  }

  // =========================================================================
  // Drawer Open / Close
  // =========================================================================
  openCart() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
  }

  closeCart() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  }

  // =========================================================================
  // Seamless Checkout Handoff
  // =========================================================================
  proceedToCheckout() {
    if (this.cart.length === 0) {
      alert('Please add at least one item to your bag to proceed.');
      return;
    }

    if (window.MinikinAudio) window.MinikinAudio.woodClick();

    // If only 1 item in cart, direct WooCommerce add-to-cart link:
    const firstItem = this.cart[0];
    const checkoutUrl = `${WC_API_CONFIG.checkoutBase}?add-to-cart=${firstItem.id}&quantity=${firstItem.quantity}`;
    window.location.href = checkoutUrl;
  }

  // =========================================================================
  // Event Listeners Setup
  // =========================================================================
  setupEventListeners() {
    // Filter Pills
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.dataset.filter;
        if (window.MinikinAudio) window.MinikinAudio.woodClick();
        this.renderCatalog();
      });
    });

    // Sort Dropdown
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.activeSort = e.target.value;
        this.renderCatalog();
      });
    }

    // Sound Toggle Button
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        if (window.MinikinAudio) {
          const enabled = window.MinikinAudio.toggle();
          soundBtn.classList.toggle('sound-on', enabled);
          soundBtn.innerHTML = enabled 
            ? '<span>🔊 Sound ON</span>' 
            : '<span>🔇 Sound OFF</span>';
        }
      });
      // Initial state
      if (window.MinikinAudio && window.MinikinAudio.isEnabled()) {
        soundBtn.classList.add('sound-on');
        soundBtn.innerHTML = '<span>🔊 Sound ON</span>';
      }
    }

    // Cart Open/Close
    const cartTrigger = document.getElementById('cart-trigger');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartBackdrop = document.getElementById('cart-backdrop');

    if (cartTrigger) {
      cartTrigger.addEventListener('click', () => {
        if (window.MinikinAudio) window.MinikinAudio.woodClick();
        this.openCart();
      });
    }
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', () => this.closeCart());
    if (cartBackdrop) cartBackdrop.addEventListener('click', () => this.closeCart());

    // Modal Close
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => this.closeQuickView());
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) this.closeQuickView();
      });
    }

    // Checkout Button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => this.proceedToCheckout());
    }
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.MinikinStore = new StoreManager();
});
