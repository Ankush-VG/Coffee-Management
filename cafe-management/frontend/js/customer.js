/* =============================================
   Customer Page Scripts
   ============================================= */

let menuItems = [];
let cart = [];
let currentCategory = 'all';

// ---- Initialize ----
(async function init() {
    const user = await checkAuth();
    if (!user) {
        window.location.href = '/';
        return;
    }

    document.getElementById('customerName').textContent = user.name;

    // Load saved cart from sessionStorage
    const savedCart = sessionStorage.getItem('cafe_cart');
    if (savedCart) {
        try { cart = JSON.parse(savedCart); } catch { cart = []; }
    }

    updateCartBadge();
    await loadMenu();
    await loadOrderHistory();
})();

// ---- Load Menu ----
async function loadMenu() {
    try {
        const data = await apiRequest('/menu');
        menuItems = data.data.filter(item => item.available);

        // Build category filters
        const categories = [...new Set(menuItems.map(i => i.category))];
        buildCategoryFilters(categories);

        renderMenu(menuItems);
    } catch (err) {
        showToast('error', 'Error', 'Failed to load menu');
    }
}

function buildCategoryFilters(categories) {
    const container = document.getElementById('categoryFilters');
    // Keep the "All" button, add others
    container.innerHTML = '<button class="filter-btn active" onclick="setCategory(\'all\', this)">All</button>';

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = cat;
        btn.onclick = function() { setCategory(cat, this); };
        container.appendChild(btn);
    });
}

function setCategory(cat, btn) {
    currentCategory = cat;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterMenu();
}

function filterMenu() {
    const search = document.getElementById('customerSearch').value.toLowerCase();

    let filtered = menuItems.filter(item => {
        const matchCategory = currentCategory === 'all' || item.category === currentCategory;
        const matchSearch = item.name.toLowerCase().includes(search) ||
                          item.category.toLowerCase().includes(search) ||
                          (item.description && item.description.toLowerCase().includes(search));
        return matchCategory && matchSearch;
    });

    renderMenu(filtered);
}

function renderMenu(items) {
    const grid = document.getElementById('menuGrid');
    const emptyState = document.getElementById('menuEmpty');

    if (items.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    grid.innerHTML = items.map(item => `
        <div class="menu-card">
            <div class="menu-card-image-wrapper">
                <img src="${escapeHtml(item.image_url || '')}" alt="${escapeHtml(item.name)}" class="menu-card-image"
                     onerror="this.src='https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400'">
                <div class="menu-card-category">${escapeHtml(item.category)}</div>
            </div>
            <div class="menu-card-body">
                <h3 class="menu-card-name">${escapeHtml(item.name)}</h3>
                <p class="menu-card-desc">${escapeHtml(item.description || 'Delicious cafe item')}</p>
                <div class="menu-card-footer">
                    <span class="menu-card-price">${formatCurrency(item.price)}</span>
                    <button class="add-to-cart-btn" onclick="addToCart(${item.id})">
                        🛒 Add
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ---- Cart Management ----
function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    const existing = cart.find(c => c.item_id === itemId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            item_id: item.id,
            name: item.name,
            price: item.price,
            image_url: item.image_url,
            quantity: 1
        });
    }

    saveCart();
    updateCartBadge();
    renderCart();
    showToast('success', 'Added!', `${item.name} added to cart`);
}

function removeFromCart(itemId) {
    cart = cart.filter(c => c.item_id !== itemId);
    saveCart();
    updateCartBadge();
    renderCart();
}

function updateQuantity(itemId, delta) {
    const item = cart.find(c => c.item_id === itemId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(itemId);
        return;
    }

    saveCart();
    updateCartBadge();
    renderCart();
}

function saveCart() {
    sessionStorage.setItem('cafe_cart', JSON.stringify(cart));
}

function updateCartBadge() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = total;
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function renderCart() {
    const cartItemsEl = document.getElementById('cartItems');
    const cartEmptyEl = document.getElementById('cartEmpty');
    const cartFooterEl = document.getElementById('cartFooter');

    if (cart.length === 0) {
        cartItemsEl.innerHTML = `
            <div class="empty-state" id="cartEmpty">
                <div class="empty-state-icon">🛒</div>
                <h3>Cart is empty</h3>
                <p>Add items from the menu to get started.</p>
            </div>`;
        cartFooterEl.style.display = 'none';
        return;
    }

    cartFooterEl.style.display = 'block';

    cartItemsEl.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${escapeHtml(item.image_url || '')}" alt="${escapeHtml(item.name)}" class="cart-item-image"
                 onerror="this.src='https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=60'">
            <div class="cart-item-info">
                <div class="cart-item-name">${escapeHtml(item.name)}</div>
                <div class="cart-item-price">${formatCurrency(item.price)}</div>
            </div>
            <div class="cart-item-qty">
                <button class="qty-btn" onclick="updateQuantity(${item.item_id}, -1)">−</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity(${item.item_id}, 1)">+</button>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.item_id})">🗑️</button>
        </div>
    `).join('');

    document.getElementById('cartTotal').textContent = formatCurrency(getCartTotal());
}

// Toggle Cart Drawer
function toggleCart() {
    const overlay = document.getElementById('cartOverlay');
    const drawer = document.getElementById('cartDrawer');

    overlay.classList.toggle('open');
    drawer.classList.toggle('open');

    if (drawer.classList.contains('open')) {
        renderCart();
    }
}

// ---- Place Order ----
async function placeOrder() {
    if (cart.length === 0) {
        showToast('warning', 'Empty Cart', 'Add items before placing an order');
        return;
    }

    const btn = document.getElementById('placeOrderBtn');
    btn.disabled = true;
    btn.textContent = 'Placing Order...';

    try {
        const items = cart.map(item => ({
            item_id: item.item_id,
            quantity: item.quantity,
            price: item.price
        }));

        await apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify({ items })
        });

        showToast('success', 'Order Placed!', 'Your order has been placed successfully');

        // Clear cart
        cart = [];
        saveCart();
        updateCartBadge();
        renderCart();
        toggleCart();

        // Reload order history
        await loadOrderHistory();
    } catch (err) {
        showToast('error', 'Order Failed', err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Place Order';
    }
}

// ---- Order History ----
async function loadOrderHistory() {
    try {
        const data = await apiRequest('/orders');
        const orders = data.data;

        const listEl = document.getElementById('orderHistoryList');
        const emptyEl = document.getElementById('ordersEmpty');

        if (orders.length === 0) {
            listEl.innerHTML = '';
            emptyEl.classList.remove('hidden');
            return;
        }

        emptyEl.classList.add('hidden');

        listEl.innerHTML = orders.map(order => `
            <div class="card order-card">
                <div class="order-card-header">
                    <div>
                        <strong style="font-size:16px;">Order #${order.id}</strong>
                        <span style="font-size:13px;color:var(--text-light);margin-left:12px;">${formatDate(order.created_at)}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span class="badge badge-${order.status}">${order.status}</span>
                        <strong style="font-size:18px;color:var(--primary);">${formatCurrency(order.total_amount)}</strong>
                    </div>
                </div>
                <div class="order-card-body">
                    ${(order.items || []).map(item => `
                        <div class="order-item-row">
                            <span>${escapeHtml(item.item_name)} × ${item.quantity}</span>
                            <span style="font-weight:600;">${formatCurrency(item.price * item.quantity)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    } catch (err) {
        showToast('error', 'Error', 'Failed to load order history');
    }
}
