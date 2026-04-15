const User = require('../models/User');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getWishlist = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).populate(
    'wishlist',
    'name slug images price discountPrice brand category ratingsAverage stock'
  );
  res.status(200).json({ status: 'success', data: { wishlist: user.wishlist } });
});

exports.toggleWishlist = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return next(new AppError('Product not found.', 404));

  const user = await User.findById(req.user.id);
  const isWishlisted = user.wishlist.includes(req.params.productId);

  if (isWishlisted) {
    user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.productId);
  } else {
    user.wishlist.push(req.params.productId);
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: isWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
    data: { isWishlisted: !isWishlisted },
  });
});
