const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/order.controller');
const { protect, restrictTo } = require('../../middleware/auth');

router.use(protect);

router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrder);
router.patch('/:id/cancel', orderController.cancelOrder);

// Admin only
router.patch('/:id/status', restrictTo('admin'), orderController.updateOrderStatus);

module.exports = router;
