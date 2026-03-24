const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// All order routes require authentication
router.use(isAuthenticated);

router.post('/', orderController.create);
router.get('/', orderController.getAll);
router.get('/stats', isAdmin, orderController.getStats);
router.get('/:id', orderController.getById);
router.put('/:id/status', isAdmin, orderController.updateStatus);

module.exports = router;
