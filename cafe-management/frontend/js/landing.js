/* =============================================
   Landing Page Scripts
   ============================================= */

// Open login modal
function openLoginModal(presetRole) {
    document.getElementById('loginModal').classList.remove('hidden');

    if (presetRole === 'admin') {
        document.getElementById('loginEmail').value = 'admin@cafe.com';
        document.getElementById('loginPassword').value = 'admin123';
    } else if (presetRole === 'customer') {
        document.getElementById('loginEmail').value = 'john@example.com';
        document.getElementById('loginPassword').value = 'john123';
    }
}

// Close login modal
function closeLoginModal() {
    document.getElementById('loginModal').classList.add('hidden');
    document.getElementById('loginForm').reset();
    document.getElementById('signupForm').reset();
}

// Switch between login and signup tabs
function switchAuthTab(tab) {
    const tabs = document.querySelectorAll('.login-tab');
    tabs.forEach(t => t.classList.remove('active'));

    if (tab === 'login') {
        tabs[0].classList.add('active');
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('signupForm').classList.add('hidden');
        document.getElementById('authModalTitle').textContent = 'Welcome Back';
    } else {
        tabs[1].classList.add('active');
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('signupForm').classList.remove('hidden');
        document.getElementById('authModalTitle').textContent = 'Create Account';
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showToast('error', 'Error', 'Please fill in all fields');
        return;
    }

    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        showToast('success', 'Welcome!', `Logged in as ${data.user.name}`);

        setTimeout(() => {
            if (data.user.role === 'admin') {
                window.location.href = '/admin';
            } else {
                window.location.href = '/customer';
            }
        }, 800);

    } catch (err) {
        showToast('error', 'Login Failed', err.message);
    }
}

// Handle signup
async function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    if (!name || !email || !password) {
        showToast('error', 'Error', 'Please fill in all fields');
        return;
    }

    try {
        const data = await apiRequest('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });

        showToast('success', 'Account Created!', 'Redirecting...');

        setTimeout(() => {
            if (data.user.role === 'admin') {
                window.location.href = '/admin';
            } else {
                window.location.href = '/customer';
            }
        }, 800);

    } catch (err) {
        showToast('error', 'Signup Failed', err.message);
    }
}

// Close modal on overlay click
document.getElementById('loginModal').addEventListener('click', function(e) {
    if (e.target === this) closeLoginModal();
});

// Check if already logged in
(async function() {
    const user = await checkAuth();
    if (user) {
        if (user.role === 'admin') {
            window.location.href = '/admin';
        } else {
            window.location.href = '/customer';
        }
    }
})();
