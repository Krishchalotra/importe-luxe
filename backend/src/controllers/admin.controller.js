const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.getDashboardStats = catchAsync(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalRevenue,
    monthRevenue,
    lastMonthRevenue,
    totalOrders,
    monthOrders,
    totalUsers,
    monthUsers,
    totalProducts,
    lowStockProducts,
    recentOrders,
    ordersByStatus,
    revenueByMonth,
    topProducts,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ stock: { $lte: 5 }, isActive: true }),
    Order.find().sort('-createdAt').limit(5).populate('user', 'name email'),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
    Product.find({ isActive: true }).sort('-soldCount').limit(5).select('name soldCount price images'),
  ]);

  const currentMonthRevenue = monthRevenue[0]?.total || 0;
  const prevMonthRevenue = lastMonthRevenue[0]?.total || 0;
  const revenueGrowth = prevMonthRevenue
    ? (((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100).toFixed(1)
    : 0;

  res.status(200).json({
    status: 'success',
    data: {
      overview: {
        totalRevenue: totalRevenue[0]?.total || 0,
        monthRevenue: currentMonthRevenue,
        revenueGrowth: parseFloat(revenueGrowth),
        totalOrders,
        monthOrders,
        totalUsers,
        monthUsers,
        totalProducts,
        lowStockProducts,
      },
      recentOrders,
      ordersByStatus,
      revenueByMonth,
      topProducts,
    },
  });
});

exports.getAllUsers = catchAsync(async (req, res) => {
  const features = new APIFeatures(User.find(), req.query).filter().sort().paginate(20);
  const [users, total] = await Promise.all([
    features.query.select('-password -refreshToken'),
    User.countDocuments(),
  ]);

  res.status(200).json({
    status: 'success',
    pagination: { total, page: features.pagination.page, limit: features.pagination.limit },
    data: { users },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { role, isActive } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role, isActive },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) return next(new AppError('User not found.', 404));
  res.status(200).json({ status: 'success', data: { user } });
});

exports.getAllOrders = catchAsync(async (req, res) => {
  const features = new APIFeatures(Order.find(), req.query).filter().sort().paginate(20);
  const [orders, total] = await Promise.all([
    features.query.populate('user', 'name email'),
    Order.countDocuments(),
  ]);

  res.status(200).json({
    status: 'success',
    pagination: { total, page: features.pagination.page, limit: features.pagination.limit },
    data: { orders },
  });
});
