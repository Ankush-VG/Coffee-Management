/* =============================================
   Shared Utility Functions
   ============================================= */

const API_BASE = window.location.origin + '/api';

// ---- API Helper ----
async function apiRequest(endpoint, options = {}) {
    const config = {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        ...options,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
}

// ---- Toast Notifications ----
function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || 'ℹ'}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="removeToast(this.parentElement)">✕</button>
    `;

    container.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => removeToast(toast), 4000);
}

function removeToast(toast) {
    if (!toast || !toast.parentElement) return;
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
}

// ---- Loading Spinner ----
function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.classList.remove('hidden');
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.classList.add('hidden');
}

// ---- Date Formatting ----
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ---- Currency Formatting ----
function formatCurrency(amount) {
    return '$' + Number(amount).toFixed(2);
}

// ---- Escape HTML (prevent XSS) ----
function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

// ---- Check Auth ----
async function checkAuth() {
    try {
        const data = await apiRequest('/auth/me');
        return data.user;
    } catch {
        return null;
    }
}

// ---- Logout ----
async function logout() {
    try {
        await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
        // ignore
    }
    window.location.href = '/';
}

// ---- Category Badge Class ----
function getCategoryBadgeClass(category) {
    const map = {
        'Coffee': 'badge-coffee',
        'Tea': 'badge-tea',
        'Pastry': 'badge-pastry',
        'Dessert': 'badge-dessert',
        'Food': 'badge-food'
    };
    return map[category] || 'badge-coffee';
}
