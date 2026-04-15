const Order = require('../models/Order');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

const TAX_RATE = 0.08; // 8%
const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 25;

exports.createOrder = catchAsync(async (req, res, next) => {
  const { items, shippingAddress, paymentMethod, notes } = req.body;

  if (!items || items.length === 0) return next(new AppError('No order items provided.', 400));

  // Validate stock and build order items
  const orderItems = await Promise.all(
    items.map(async ({ product: productId, quantity }) => {
      const product = await Product.findById(productId);
      if (!product) throw new AppError(`Product ${productId} not found.`, 404);
      if (product.stock < quantity) {
        throw new AppError(`Insufficient stock for ${product.name}.`, 400);
      }
      return {
        product: product._id,
        name: product.name,
        image: product.images[0]?.url,
        price: product.discountPrice || product.price,
        quantity,
      };
    })
  );

  const itemsPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const taxPrice = parseFloat((itemsPrice * TAX_RATE).toFixed(2));
  const totalAmount = parseFloat((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalAmount,
    notes,
  });

  // Decrement stock
  await Promise.all(
    items.map(({ product: productId, quantity }) =>
      Product.findByIdAndUpdate(productId, {
        $inc: { stock: -quantity, soldCount: quantity },
      })
    )
  );

  res.status(201).json({ status: 'success', data: { order } });
});

exports.getMyOrders = catchAsync(async (req, res) => {
  const features = new APIFeatures(
    Order.find({ user: req.user.id }),
    req.query
  )
    .sort()
    .paginate(10);

  const [orders, total] = await Promise.all([
    features.query.populate('items.product', 'name images slug'),
    Order.countDocuments({ user: req.user.id }),
  ]);

  res.status(200).json({
    status: 'success',
    pagination: { total, page: features.pagination.page, limit: features.pagination.limit },
    data: { orders },
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'name images slug');

  if (!order) return next(new AppError('Order not found.', 404));

  // Users can only see their own orders; admins can see all
  if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
    return next(new AppError('Not authorized to view this order.', 403));
  }

  res.status(200).json({ status: 'success', data: { order } });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status, note, trackingNumber } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError('Order not found.', 404));

  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: ['refunded'],
  };

  if (!validTransitions[order.status]?.includes(status)) {
    return next(new AppError(`Cannot transition from ${order.status} to ${status}.`, 400));
  }

  order.status = status;
  order.statusHistory.push({ status, note });

  if (status === 'delivered') {
    order.isPaid = true;
    order.paidAt = Date.now();
  }

  if (trackingNumber) order.trackingNumber = trackingNumber;

  await order.save();
  res.status(200).json({ status: 'success', data: { order } });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
  if (!order) return next(new AppError('Order not found.', 404));

  if (!['pending', 'confirmed'].includes(order.status)) {
    return next(new AppError('Order cannot be cancelled at this stage.', 400));
  }

  order.status = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', note: 'Cancelled by user' });

  // Restore stock
  await Promise.all(
    order.items.map((item) =>
      Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, soldCount: -item.quantity },
      })
    )
  );

  await order.save();
  res.status(200).json({ status: 'success', data: { order } });
});
