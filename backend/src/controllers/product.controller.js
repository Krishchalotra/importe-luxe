const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const { cloudinary } = require('../config/cloudinary');

exports.getProducts = catchAsync(async (req, res) => {
  const features = new APIFeatures(
    Product.find({ isActive: true }),
    req.query
  )
    .filter()
    .search(['name', 'brand', 'description'])
    .sort()
    .limitFields()
    .paginate(12);

  const [products, total] = await Promise.all([
    features.query,
    Product.countDocuments({ isActive: true }),
  ]);

  const { page, limit } = features.pagination;

  res.status(200).json({
    status: 'success',
    results: products.length,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    data: { products },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({
    $or: [{ slug: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }],
    isActive: true,
  }).populate('reviews.user', 'name avatar');

  if (!product) return next(new AppError('Product not found.', 404));

  res.status(200).json({ status: 'success', data: { product } });
});

exports.getFeaturedProducts = catchAsync(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .sort('-createdAt')
    .limit(8)
    .select('name slug images price discountPrice brand category ratingsAverage');

  res.status(200).json({ status: 'success', data: { products } });
});

exports.getProductsByCategory = catchAsync(async (req, res) => {
  const { category } = req.params;
  const features = new APIFeatures(
    Product.find({ category, isActive: true }),
    req.query
  )
    .sort()
    .paginate(12);

  const [products, total] = await Promise.all([
    features.query,
    Product.countDocuments({ category, isActive: true }),
  ]);

  res.status(200).json({
    status: 'success',
    results: products.length,
    pagination: { total, page: features.pagination.page, limit: features.pagination.limit },
    data: { products },
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const images = req.files?.map((file) => ({
    url: file.path,
    publicId: file.filename,
    alt: req.body.name,
  })) || [];

  if (images.length === 0) return next(new AppError('At least one product image is required.', 400));

  const product = await Product.create({ ...req.body, images });
  res.status(201).json({ status: 'success', data: { product } });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found.', 404));

  // Handle new image uploads
  if (req.files?.length > 0) {
    const newImages = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
      alt: req.body.name || product.name,
    }));
    req.body.images = [...product.images, ...newImages];
  }

  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { product: updated } });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found.', 404));

  // Delete images from Cloudinary
  await Promise.all(
    product.images.map((img) => cloudinary.uploader.destroy(img.publicId))
  );

  await product.deleteOne();
  res.status(204).json({ status: 'success', data: null });
});

exports.addReview = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found.', 404));

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user.id.toString()
  );
  if (alreadyReviewed) return next(new AppError('You have already reviewed this product.', 400));

  product.reviews.push({
    user: req.user.id,
    name: req.user.name,
    rating: req.body.rating,
    comment: req.body.comment,
  });

  await product.save();
  await Product.calcAverageRatings(product._id);

  res.status(201).json({ status: 'success', message: 'Review added successfully' });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found.', 404));

  product.reviews = product.reviews.filter(
    (r) => r._id.toString() !== req.params.reviewId
  );

  await product.save();
  await Product.calcAverageRatings(product._id);

  res.status(204).json({ status: 'success', data: null });
});
