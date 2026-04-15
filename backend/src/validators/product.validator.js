const { body } = require('express-validator');

exports.createProductValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('category')
    .isIn(['watches', 'perfumes', 'apparel', 'accessories', 'jewelry', 'handbags', 'footwear'])
    .withMessage('Invalid category'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('discountPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount price must be a positive number'),
];
