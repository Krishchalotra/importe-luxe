const express = require('express');
const router = express.Router();
const ebayController = require('../../controllers/ebay.controller');
const { protect, restrictTo } = require('../../middleware/auth');

// Admin only — trigger eBay sync manually
router.use(protect, restrictTo('admin'));
router.post('/sync', ebayController.syncAll);
router.post('/sync/:category', ebayController.syncOne);

module.exports = router;
