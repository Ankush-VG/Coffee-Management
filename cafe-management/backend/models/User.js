const pool = require('../config/db');

const User = {
    async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    async findById(id) {
        const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
        return rows[0];
    },

    async create(name, email, password, role = 'customer') {
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, password, role]
        );
        return result.insertId;
    },

    async getAll() {
        const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users');
        return rows;
    }
};

module.exports = User;
