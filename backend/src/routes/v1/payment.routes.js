const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/payment.controller');
const { protect } = require('../../middleware/auth');

// Stripe webhook needs raw body - handled in server.js before JSON middleware
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);

router.use(protect);
router.post('/create-intent/:orderId', paymentController.createPaymentIntent);

module.exports = router;
