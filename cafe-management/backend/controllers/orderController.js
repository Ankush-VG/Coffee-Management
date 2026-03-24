const Order = require('../models/Order');

const orderController = {
    // POST /api/orders
    async create(req, res) {
        try {
            const { items } = req.body;
            const userId = req.session.user.id;

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
            }

            let totalAmount = 0;
            for (const item of items) {
                if (!item.item_id || !item.quantity || !item.price) {
                    return res.status(400).json({ success: false, message: 'Each item must have item_id, quantity, and price' });
                }
                totalAmount += item.price * item.quantity;
            }

            totalAmount = Math.round(totalAmount * 100) / 100;

            const orderId = await Order.create(userId, totalAmount, items);
            const order = await Order.getById(orderId);
            const orderItems = await Order.getOrderItems(orderId);

            res.status(201).json({
                success: true,
                message: 'Order placed successfully',
                data: { ...order, items: orderItems }
            });
        } catch (err) {
            console.error('Create order error:', err);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    // GET /api/orders (Admin: all, Customer: own)
    async getAll(req, res) {
        try {
            let orders;
            if (req.session.user.role === 'admin') {
                orders = await Order.getAll();
            } else {
                orders = await Order.getByUserId(req.session.user.id);
            }

            // Attach items to each order
            for (let order of orders) {
                order.items = await Order.getOrderItems(order.id);
            }

            res.json({ success: true, data: orders });
        } catch (err) {
            console.error('Get orders error:', err);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    // GET /api/orders/:id
    async getById(req, res) {
        try {
            const order = await Order.getById(req.params.id);
            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }

            // Non-admin can only see own orders
            if (req.session.user.role !== 'admin' && order.user_id !== req.session.user.id) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            order.items = await Order.getOrderItems(order.id);
            res.json({ success: true, data: order });
        } catch (err) {
            console.error('Get order error:', err);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    // PUT /api/orders/:id/status (Admin)
    async updateStatus(req, res) {
        try {
            const { status } = req.body;
            if (!['pending', 'completed', 'cancelled'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status' });
            }

            const order = await Order.getById(req.params.id);
            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }

            await Order.updateStatus(req.params.id, status);
            const updated = await Order.getById(req.params.id);
            updated.items = await Order.getOrderItems(updated.id);
            res.json({ success: true, message: 'Order status updated', data: updated });
        } catch (err) {
            console.error('Update status error:', err);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    // GET /api/orders/stats (Admin)
    async getStats(req, res) {
        try {
            const stats = await Order.getStats();
            res.json({ success: true, data: stats });
        } catch (err) {
            console.error('Get stats error:', err);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
};

module.exports = orderController;
