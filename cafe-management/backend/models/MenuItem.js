const pool = require('../config/db');

const MenuItem = {
    async getAll() {
        const [rows] = await pool.query('SELECT * FROM menu_items ORDER BY category, name');
        return rows;
    },

    async getById(id) {
        const [rows] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [id]);
        return rows[0];
    },

    async create(data) {
        const { name, category, price, image_url, description } = data;
        const [result] = await pool.query(
            'INSERT INTO menu_items (name, category, price, image_url, description) VALUES (?, ?, ?, ?, ?)',
            [name, category, price, image_url || null, description || null]
        );
        return result.insertId;
    },

    async update(id, data) {
        const { name, category, price, image_url, description, available } = data;
        const [result] = await pool.query(
            'UPDATE menu_items SET name = ?, category = ?, price = ?, image_url = ?, description = ?, available = ? WHERE id = ?',
            [name, category, price, image_url || null, description || null, available !== undefined ? available : 1, id]
        );
        return result.affectedRows;
    },

    async delete(id) {
        const [result] = await pool.query('DELETE FROM menu_items WHERE id = ?', [id]);
        return result.affectedRows;
    },

    async search(query) {
        const searchTerm = `%${query}%`;
        const [rows] = await pool.query(
            'SELECT * FROM menu_items WHERE name LIKE ? OR category LIKE ? OR description LIKE ?',
            [searchTerm, searchTerm, searchTerm]
        );
        return rows;
    },

    async getCategories() {
        const [rows] = await pool.query('SELECT DISTINCT category FROM menu_items ORDER BY category');
        return rows.map(r => r.category);
    }
};

module.exports = MenuItem;
