const { syncAllCategories, syncCategory } = require('../services/ebay.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// POST /api/v1/ebay/sync  — sync all categories
exports.syncAll = catchAsync(async (req, res) => {
  const limitPerCategory = parseInt(req.query.limit) || 8;
  const results = await syncAllCategories(limitPerCategory);
  res.status(200).json({ status: 'success', data: results });
});

// POST /api/v1/ebay/sync/:category  — sync one category
exports.syncOne = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const limit = parseInt(req.query.limit) || 8;
  try {
    const result = await syncCategory(category, limit);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
});
