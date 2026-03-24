/* =============================================
   Admin Dashboard Scripts
   ============================================= */

let allMenuItems = [];
let allOrders = [];
let deleteItemId = null;

// ---- Initialize ----
(async function init() {
    const user = await checkAuth();
    if (!user || user.role !== 'admin') {
        window.location.href = '/';
        return;
    }

    document.getElementById('adminName').textContent = user.name;
    document.getElementById('adminAvatar').textContent = user.name.charAt(0).toUpperCase();

    await loadDashboard();
})();

// ---- Page Switching ----
function switchPage(page) {
    // Hide all pages
    document.getElementById('dashboardPage').classList.add('hidden');
    document.getElementById('menuPage').classList.add('hidden');
    document.getElementById('ordersPage').classList.add('hidden');

    // Show selected page
    document.getElementById(page + 'Page').classList.remove('hidden');

    // Update sidebar
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    document.querySelector(`.sidebar-nav a[data-page="${page}"]`).classList.add('active');

    // Load data
    if (page === 'dashboard') loadDashboard();
    if (page === 'menu') loadMenuItems();
    if (page === 'orders') loadOrders();
}

// ---- Dashboard ----
async function loadDashboard() {
    try {
        const [statsData, ordersData] = await Promise.all([
            apiRequest('/orders/stats'),
            apiRequest('/orders')
        ]);

        const stats = statsData.data;
        document.getElementById('statTotalOrders').textContent = stats.totalOrders;
        document.getElementById('statRevenue').textContent = formatCurrency(stats.totalRevenue);
        document.getElementById('statPending').textContent = stats.pendingOrders;
        document.getElementById('statItems').textContent = stats.totalItems;

        // Recent orders (last 5)
        const orders = ordersData.data.slice(0, 5);
        renderRecentOrders(orders);
    } catch (err) {
        showToast('error', 'Error', 'Failed to load dashboard data');
    }
}

function renderRecentOrders(orders) {
    const tbody = document.getElementById('recentOrdersTable');

    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="5">
                <div class="empty-state" style="padding:40px;">
                    <div class="empty-state-icon">📦</div>
                    <h3>No orders yet</h3>
                </div>
            </td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td><strong>#${order.id}</strong></td>
            <td>${escapeHtml(order.customer_name)}</td>
            <td><strong>${formatCurrency(order.total_amount)}</strong></td>
            <td><span class="badge badge-${order.status}">${order.status}</span></td>
            <td>${formatDate(order.created_at)}</td>
        </tr>
    `).join('');
}

// ---- Menu Management ----
async function loadMenuItems() {
    try {
        const data = await apiRequest('/menu');
        allMenuItems = data.data;
        renderMenuTable(allMenuItems);
    } catch (err) {
        showToast('error', 'Error', 'Failed to load menu items');
    }
}

function renderMenuTable(items) {
    const tbody = document.getElementById('menuTable');

    if (items.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="6">
                <div class="empty-state" style="padding:40px;">
                    <div class="empty-state-icon">🍽️</div>
                    <h3>No menu items</h3>
                    <p>Add your first menu item to get started.</p>
                </div>
            </td></tr>`;
        return;
    }

    tbody.innerHTML = items.map(item => `
        <tr>
            <td>
                <img src="${escapeHtml(item.image_url || '')}" alt="${escapeHtml(item.name)}" 
                     style="width:50px;height:50px;border-radius:8px;object-fit:cover;"
                     onerror="this.src='https://via.placeholder.com/50x50?text=No+Img'">
            </td>
            <td>
                <strong>${escapeHtml(item.name)}</strong>
                ${item.description ? `<br><small style="color:var(--text-light)">${escapeHtml(item.description).substring(0, 50)}...</small>` : ''}
            </td>
            <td><span class="badge ${getCategoryBadgeClass(item.category)}">${escapeHtml(item.category)}</span></td>
            <td><strong>${formatCurrency(item.price)}</strong></td>
            <td><span class="badge ${item.available ? 'badge-completed' : 'badge-cancelled'}">${item.available ? 'Available' : 'Unavailable'}</span></td>
            <td>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-sm btn-outline" onclick="editMenuItem(${item.id})">✏️ Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteMenuItem(${item.id}, '${escapeHtml(item.name)}')">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterMenuTable() {
    const search = document.getElementById('menuSearch').value.toLowerCase();
    const filtered = allMenuItems.filter(item =>
        item.name.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search)
    );
    renderMenuTable(filtered);
}

// Menu Modal
function openMenuModal(item = null) {
    document.getElementById('menuModal').classList.remove('hidden');

    if (item) {
        document.getElementById('menuModalTitle').textContent = 'Edit Menu Item';
        document.getElementById('menuSubmitBtn').textContent = 'Update Item';
        document.getElementById('menuItemId').value = item.id;
        document.getElementById('menuItemName').value = item.name;
        document.getElementById('menuItemCategory').value = item.category;
        document.getElementById('menuItemPrice').value = item.price;
        document.getElementById('menuItemImage').value = item.image_url || '';
        document.getElementById('menuItemDesc').value = item.description || '';
    } else {
        document.getElementById('menuModalTitle').textContent = 'Add Menu Item';
        document.getElementById('menuSubmitBtn').textContent = 'Add Item';
        document.getElementById('menuForm').reset();
        document.getElementById('menuItemId').value = '';
    }
}

function closeMenuModal() {
    document.getElementById('menuModal').classList.add('hidden');
    document.getElementById('menuForm').reset();
}

async function editMenuItem(id) {
    const item = allMenuItems.find(i => i.id === id);
    if (item) openMenuModal(item);
}

async function handleMenuSubmit(e) {
    e.preventDefault();

    const itemId = document.getElementById('menuItemId').value;
    const body = {
        name: document.getElementById('menuItemName').value.trim(),
        category: document.getElementById('menuItemCategory').value,
        price: parseFloat(document.getElementById('menuItemPrice').value),
        image_url: document.getElementById('menuItemImage').value.trim(),
        description: document.getElementById('menuItemDesc').value.trim()
    };

    if (!body.name || !body.category || isNaN(body.price)) {
        showToast('error', 'Error', 'Please fill in all required fields');
        return;
    }

    try {
        if (itemId) {
            await apiRequest(`/menu/${itemId}`, {
                method: 'PUT',
                body: JSON.stringify(body)
            });
            showToast('success', 'Updated', 'Menu item updated successfully');
        } else {
            await apiRequest('/menu', {
                method: 'POST',
                body: JSON.stringify(body)
            });
            showToast('success', 'Added', 'Menu item added successfully');
        }

        closeMenuModal();
        await loadMenuItems();
    } catch (err) {
        showToast('error', 'Error', err.message);
    }
}

// Delete Menu Item
function deleteMenuItem(id, name) {
    deleteItemId = id;
    document.getElementById('deleteItemName').textContent = name;
    document.getElementById('deleteModal').classList.remove('hidden');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
    deleteItemId = null;
}

async function confirmDelete() {
    if (!deleteItemId) return;

    try {
        await apiRequest(`/menu/${deleteItemId}`, { method: 'DELETE' });
        showToast('success', 'Deleted', 'Menu item deleted successfully');
        closeDeleteModal();
        await loadMenuItems();
    } catch (err) {
        showToast('error', 'Error', err.message);
    }
}

// ---- Orders Management ----
async function loadOrders() {
    try {
        const data = await apiRequest('/orders');
        allOrders = data.data;
        renderOrdersTable(allOrders);
    } catch (err) {
        showToast('error', 'Error', 'Failed to load orders');
    }
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById('ordersTable');

    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="7">
                <div class="empty-state" style="padding:40px;">
                    <div class="empty-state-icon">📦</div>
                    <h3>No orders found</h3>
                </div>
            </td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td><strong>#${order.id}</strong></td>
            <td>${escapeHtml(order.customer_name)}</td>
            <td>${order.items ? order.items.length + ' items' : '-'}</td>
            <td><strong>${formatCurrency(order.total_amount)}</strong></td>
            <td><span class="badge badge-${order.status}">${order.status}</span></td>
            <td>${formatDate(order.created_at)}</td>
            <td>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="btn btn-sm btn-outline" onclick="viewOrderDetail(${order.id})">👁️ View</button>
                    ${order.status === 'pending' ? `
                        <button class="btn btn-sm btn-success" onclick="updateOrderStatus(${order.id}, 'completed')">✅</button>
                        <button class="btn btn-sm btn-danger" onclick="updateOrderStatus(${order.id}, 'cancelled')">✕</button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function filterOrders(status, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (status === 'all') {
        renderOrdersTable(allOrders);
    } else {
        renderOrdersTable(allOrders.filter(o => o.status === status));
    }
}

async function updateOrderStatus(id, status) {
    try {
        await apiRequest(`/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        showToast('success', 'Updated', `Order #${id} marked as ${status}`);
        await loadOrders();
    } catch (err) {
        showToast('error', 'Error', err.message);
    }
}

function viewOrderDetail(id) {
    const order = allOrders.find(o => o.id === id);
    if (!order) return;

    const content = document.getElementById('orderDetailContent');
    content.innerHTML = `
        <div style="margin-bottom:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h4 style="font-size:16px;">Order #${order.id}</h4>
                <span class="badge badge-${order.status}">${order.status}</span>
            </div>
            <p style="font-size:13px;color:var(--text-light);margin-bottom:4px;">
                <strong>Customer:</strong> ${escapeHtml(order.customer_name)}
            </p>
            <p style="font-size:13px;color:var(--text-light);margin-bottom:16px;">
                <strong>Date:</strong> ${formatDate(order.created_at)}
            </p>
        </div>
        <div style="border:1px solid var(--border);border-radius:var(--radius-md);overflow:hidden;">
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr>
                        <th style="padding:10px 14px;font-size:12px;">Item</th>
                        <th style="padding:10px 14px;font-size:12px;">Qty</th>
                        <th style="padding:10px 14px;font-size:12px;text-align:right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${(order.items || []).map(item => `
                        <tr>
                            <td style="padding:10px 14px;font-size:14px;border-top:1px solid var(--border);">${escapeHtml(item.item_name)}</td>
                            <td style="padding:10px 14px;font-size:14px;border-top:1px solid var(--border);">x${item.quantity}</td>
                            <td style="padding:10px 14px;font-size:14px;border-top:1px solid var(--border);text-align:right;">${formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding-top:16px;border-top:2px solid var(--border);">
            <strong style="font-size:16px;">Total</strong>
            <strong style="font-size:20px;color:var(--primary);">${formatCurrency(order.total_amount)}</strong>
        </div>
    `;

    document.getElementById('orderDetailModal').classList.remove('hidden');
}

function closeOrderDetail() {
    document.getElementById('orderDetailModal').classList.add('hidden');
}

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.add('hidden');
        }
    });
});
