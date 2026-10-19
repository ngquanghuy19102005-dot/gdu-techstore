// ===== SHARED UTILITIES =====

// Format currency VND
function formatVND(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// Render star rating
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let html = '';
  for (let i = 0; i < 5; i++) {
    if (i < full) html += '★';
    else if (i === full && half) html += '☆';
    else html += '☆';
  }
  return html;
}

// Fetch products from JSON
async function fetchProducts() {
  try {
    const res = await fetch('products.json');
    if (!res.ok) throw new Error('Fetch failed');
    return await res.json();
  } catch (e) {
    console.error('Could not load products:', e);
    return [];
  }
}

// ===== CART FUNCTIONS =====
function getCart() {
  return JSON.parse(localStorage.getItem('gdu_cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('gdu_cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product, qty = 1) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === product.id);
  if (idx > -1) {
    cart[idx].qty = Math.min(cart[idx].qty + qty, product.stock);
  } else {
    cart.push({ ...product, qty });
  }
  saveCart(cart);
  showToast('Thêm vào giỏ!', `${product.name} đã được thêm vào giỏ hàng.`, 'success');
}

function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.classList.toggle('hidden', total === 0);
  });
}

// ===== TOAST =====
function showToast(title, msg, type = 'default') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', default: '🛒' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.default}</span>
    <div class="toast-text">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; toast.style.transition = 'all 0.3s ease'; setTimeout(() => toast.remove(), 300); }, 2800);
}

// ===== HEADER SETUP =====
function initHeader() {
  // Scroll effect
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Active nav
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-list a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === path);
  });

  // Hamburger
  const ham = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  ham?.addEventListener('click', () => {
    ham.classList.toggle('open');
    mobileMenu?.classList.toggle('open');
  });

  // Header search
  const searchInput = document.querySelector('.search-bar input');
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
      window.location.href = `products.html?q=${encodeURIComponent(searchInput.value.trim())}`;
    }
  });

  updateCartBadge();
}

// ===== BACK TO TOP =====
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 400));
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ===== RENDER PRODUCT CARD =====
function renderProductCard(p) {
  const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
  return `
    <article class="product-card" onclick="location.href='detail.html?id=${p.id}'">
      ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
      <div class="product-img-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
        <div class="product-overlay">
          <button class="overlay-btn" onclick="event.stopPropagation();location.href='detail.html?id=${p.id}'" title="Xem chi tiết">👁</button>
          <button class="overlay-btn" onclick="event.stopPropagation();addToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})" title="Thêm vào giỏ">🛒</button>
        </div>
      </div>
      <div class="product-body">
        <div class="product-category">${p.category === 'laptop' ? '💻 Laptop' : '📱 Điện thoại'}</div>
        <h3 class="product-name">${p.name}</h3>
        <div class="product-rating">
          <span class="stars">${renderStars(p.rating)}</span>
          <span class="rating-count">${p.rating} (${p.reviews})</span>
        </div>
        <div class="product-footer">
          <div class="product-price">
            <span class="price-current">${formatVND(p.price)}</span>
            ${p.originalPrice ? `<span class="price-original">${formatVND(p.originalPrice)}</span>` : ''}
          </div>
          <button class="btn-cart" onclick="event.stopPropagation();handleAddToCart(this, ${JSON.stringify(p).replace(/"/g, '&quot;')})" title="Thêm vào giỏ hàng">+</button>
        </div>
      </div>
    </article>`;
}

function handleAddToCart(btn, product) {
  addToCart(product);
  btn.textContent = '✓';
  btn.classList.add('added');
  setTimeout(() => { btn.textContent = '+'; btn.classList.remove('added'); }, 1500);
}

// Init on load
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initBackToTop();
});
