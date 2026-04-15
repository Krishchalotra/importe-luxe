const express = require('express');
const router = express.Router();
const productController = require('../../controllers/product.controller');
const { protect, restrictTo } = require('../../middleware/auth');
const { upload } = require('../../config/cloudinary');
const { createProductValidator } = require('../../validators/product.validator');
const validate = require('../../middleware/validate');

// Public routes
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:id', productController.getProduct);

// Protected routes
router.use(protect);
router.post('/:id/reviews', productController.addReview);
router.delete('/:id/reviews/:reviewId', productController.deleteReview);

// Admin only
router.use(restrictTo('admin'));
router.post('/', upload.array('images', 5), createProductValidator, validate, productController.createProduct);
router.patch('/:id', upload.array('images', 5), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
