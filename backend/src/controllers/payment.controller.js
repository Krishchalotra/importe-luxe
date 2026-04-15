const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createPaymentIntent = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return next(new AppError('Order not found.', 404));

  if (order.user.toString() !== req.user.id) {
    return next(new AppError('Not authorized.', 403));
  }

  if (order.isPaid) return next(new AppError('Order is already paid.', 400));

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalAmount * 100), // Stripe uses cents
    currency: 'usd',
    metadata: { orderId: order._id.toString(), userId: req.user.id },
  });

  res.status(200).json({
    status: 'success',
    clientSecret: paymentIntent.client_secret,
  });
});

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const { orderId } = event.data.object.metadata;
    await Order.findByIdAndUpdate(orderId, {
      isPaid: true,
      paidAt: Date.now(),
      status: 'confirmed',
      'paymentResult.id': event.data.object.id,
      'paymentResult.status': event.data.object.status,
      $push: { statusHistory: { status: 'confirmed', note: 'Payment confirmed via Stripe' } },
    });
  }

  res.json({ received: true });
};
