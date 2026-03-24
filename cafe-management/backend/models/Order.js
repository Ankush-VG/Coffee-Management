const pool = require('../config/db');

const Order = {
    async create(userId, totalAmount, items) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [orderResult] = await conn.query(
                'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
                [userId, totalAmount, 'pending']
            );
            const orderId = orderResult.insertId;

            for (const item of items) {
                await conn.query(
                    'INSERT INTO order_items (order_id, item_id, quantity, price) VALUES (?, ?, ?, ?)',
                    [orderId, item.item_id, item.quantity, item.price]
                );
            }

            await conn.commit();
            return orderId;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    },

    async getAll() {
        const [rows] = await pool.query(`
            SELECT o.*, u.name as customer_name, u.email as customer_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `);
        return rows;
    },

    async getByUserId(userId) {
        const [rows] = await pool.query(`
            SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
        `, [userId]);
        return rows;
    },

    async getById(id) {
        const [rows] = await pool.query(`
            SELECT o.*, u.name as customer_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        `, [id]);
        return rows[0];
    },

    async getOrderItems(orderId) {
        const [rows] = await pool.query(`
            SELECT oi.*, mi.name as item_name, mi.category
            FROM order_items oi
            JOIN menu_items mi ON oi.item_id = mi.id
            WHERE oi.order_id = ?
        `, [orderId]);
        return rows;
    },

    async updateStatus(id, status) {
        const [result] = await pool.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows;
    },

    async getStats() {
        const [totalOrders] = await pool.query('SELECT COUNT(*) as count FROM orders');
        const [totalRevenue] = await pool.query('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = "completed"');
        const [pendingOrders] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE status = "pending"');
        const [totalItems] = await pool.query('SELECT COUNT(*) as count FROM menu_items');

        return {
            totalOrders: totalOrders[0].count,
            totalRevenue: totalRevenue[0].total,
            pendingOrders: pendingOrders[0].count,
            totalItems: totalItems[0].count
        };
    }
};

module.exports = Order;
