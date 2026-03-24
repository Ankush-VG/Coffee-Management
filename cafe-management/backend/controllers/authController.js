const bcrypt = require('bcrypt');
const User = require('../models/User');

const SALT_ROUNDS = 10;

const authController = {
    // POST /api/auth/signup
    async signup(req, res) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
            }

            if (password.length < 4) {
                return res.status(400).json({ success: false, message: 'Password must be at least 4 characters' });
            }

            const existing = await User.findByEmail(email);
            if (existing) {
                return res.status(409).json({ success: false, message: 'Email already registered' });
            }

            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            const userId = await User.create(name, email, hashedPassword, 'customer');
            const user = await User.findById(userId);

            req.session.user = user;
            res.status(201).json({ success: true, message: 'Account created successfully', user });
        } catch (err) {
            console.error('Signup error:', err);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    // POST /api/auth/login
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email and password are required' });
            }

            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            // Support both bcrypt hashed and legacy plaintext passwords
            let passwordValid = false;
            if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
                passwordValid = await bcrypt.compare(password, user.password);
            } else {
                passwordValid = (user.password === password);
            }

            if (!passwordValid) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            const { password: _, ...safeUser } = user;
            req.session.user = safeUser;
            res.json({ success: true, message: 'Login successful', user: safeUser });
        } catch (err) {
            console.error('Login error:', err);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    // POST /api/auth/logout
    async logout(req, res) {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Logout failed' });
            }
            res.json({ success: true, message: 'Logged out successfully' });
        });
    },

    // GET /api/auth/me
    async me(req, res) {
        if (req.session && req.session.user) {
            return res.json({ success: true, user: req.session.user });
        }
        res.status(401).json({ success: false, message: 'Not logged in' });
    }
};

module.exports = authController;
