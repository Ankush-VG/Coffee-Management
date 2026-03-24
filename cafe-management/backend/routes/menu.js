const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', menuController.getAll);
router.get('/search', menuController.search);
router.get('/categories', menuController.getCategories);
router.get('/:id', menuController.getById);

// Admin-only routes
router.post('/', isAuthenticated, isAdmin, menuController.create);
router.put('/:id', isAuthenticated, isAdmin, menuController.update);
router.delete('/:id', isAuthenticated, isAdmin, menuController.delete);

module.exports = router;
