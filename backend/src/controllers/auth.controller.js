const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { createSendToken, verifyRefreshToken, signToken } = require('../utils/jwt');

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new AppError('Email already registered.', 400));

  const user = await User.create({ name, email, password });
  createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password.', 401));
  }

  if (!user.isActive) return next(new AppError('Your account has been deactivated.', 401));

  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};

exports.refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return next(new AppError('No refresh token provided.', 401));

  const decoded = verifyRefreshToken(refreshToken);
  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError('User not found.', 401));

  const newToken = signToken(user._id, user.role);
  res.status(200).json({ status: 'success', token: newToken });
});

exports.getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist', 'name images price slug');
  res.status(200).json({ status: 'success', data: { user } });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const { password, role } = req.body;
  if (password) return next(new AppError('Use /change-password to update your password.', 400));
  if (role) return next(new AppError('You cannot change your role.', 400));

  const allowedFields = ['name', 'phone', 'addresses'];
  const filteredBody = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) filteredBody[field] = req.body[field];
  });

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});
