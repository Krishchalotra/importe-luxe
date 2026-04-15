const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin.controller');
const orderController = require('../../controllers/order.controller');
const { protect, restrictTo } = require('../../middleware/auth');

router.use(protect, restrictTo('admin'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id', adminController.updateUser);
router.get('/orders', adminController.getAllOrders);

module.exports = router;
