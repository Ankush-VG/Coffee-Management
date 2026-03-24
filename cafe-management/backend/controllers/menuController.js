const MenuItem = require('../models/MenuItem');

const menuController = {
    // GET /api/menu
    async getAll(req, res) {
        try {
            const items = await MenuItem.getAll();
            res.json({ success: true, data: items });
        } catch (err) {
            console.error('Get menu error:', err);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    // GET /api/menu/search?q=...
    async search(req, res) {
        try {
            const { q } = req.query;
            if (!q) {
                const items = await MenuItem.getAll();
                return res.json({ success: true, data: items });
            }
            const items = await MenuItem.search(q);
            res.json({ success: true, data: items });
        } catch (err) {
            console.error('Search error:', err);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    // GET /api/menu/categories
    async getCategories(req, res) {
        try {
            const categories = await MenuItem.getCategories();
            res.json({ success: true, data: categories });
        } catch (err) {
            console.error('Get categories error:', err);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    // GET /api/menu/:id
    async getById(req, res) {
        try {
            const item = await MenuItem.getById(req.params.id);
            if (!item) {
                return res.status(404).json({ success: false, message: 'Menu item not found' });
            }
            res.json({ success: true, data: item });
        } catch (err) {
            console.error('Get item error:', err);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    // POST /api/menu (Admin)
    async create(req, res) {
        try {
            const { name, category, price, image_url, description } = req.body;

            if (!name || !category || !price) {
                return res.status(400).json({ success: false, message: 'Name, category, and price are required' });
            }

            const id = await MenuItem.create({ name, category, price, image_url, description });
            const item = await MenuItem.getById(id);
            res.status(201).json({ success: true, message: 'Menu item created', data: item });
        } catch (err) {
            console.error('Create item error:', err);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    // PUT /api/menu/:id (Admin)
    async update(req, res) {
        try {
            const existing = await MenuItem.getById(req.params.id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Menu item not found' });
            }

            const { name, category, price, image_url, description, available } = req.body;
            await MenuItem.update(req.params.id, {
                name: name || existing.name,
                category: category || existing.category,
                price: price !== undefined ? price : existing.price,
                image_url: image_url !== undefined ? image_url : existing.image_url,
                description: description !== undefined ? description : existing.description,
                available: available !== undefined ? available : existing.available
            });

            const updated = await MenuItem.getById(req.params.id);
            res.json({ success: true, message: 'Menu item updated', data: updated });
        } catch (err) {
            console.error('Update item error:', err);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    // DELETE /api/menu/:id (Admin)
    async delete(req, res) {
        try {
            const existing = await MenuItem.getById(req.params.id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Menu item not found' });
            }

            await MenuItem.delete(req.params.id);
            res.json({ success: true, message: 'Menu item deleted' });
        } catch (err) {
            console.error('Delete item error:', err);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
};

module.exports = menuController;
