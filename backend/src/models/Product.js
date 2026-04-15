const mongoose = require('mongoose');
const slugify = require('slugify');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters'],
    },
    slug: { type: String },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    shortDescription: { type: String, maxlength: 300 },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['watches', 'perfumes', 'apparel', 'accessories', 'jewelry', 'handbags', 'footwear'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price must be less than original price',
      },
    },
    discountPercent: { type: Number, default: 0 },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        alt: String,
      },
    ],
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, unique: true, sparse: true },
    tags: [String],
    specifications: [{ key: String, value: String }],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    reviews: [reviewSchema],
    ratingsAverage: { type: Number, default: 0, min: 0, max: 5, set: (val) => Math.round(val * 10) / 10 },
    ratingsCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    ebayItemId: { type: String, sparse: true },
    ebayUrl: { type: String },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Compound indexes for performance
productSchema.index({ category: 1, price: -1 });
productSchema.index({ brand: 1, category: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ slug: 1 });
productSchema.index({ createdAt: -1 });

// Virtual: effective price (discount or original)
productSchema.virtual('effectivePrice').get(function () {
  return this.discountPrice || this.price;
});

// Auto-generate slug from name
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Auto-calculate discount percent
productSchema.pre('save', function (next) {
  if (this.discountPrice && this.price) {
    this.discountPercent = Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  next();
});

// Static method: recalculate ratings after review add/remove
productSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    { $match: { _id: productId } },
    { $unwind: '$reviews' },
    {
      $group: {
        _id: '$_id',
        avgRating: { $avg: '$reviews.rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await this.findByIdAndUpdate(productId, {
      ratingsAverage: stats[0].avgRating,
      ratingsCount: stats[0].count,
    });
  } else {
    await this.findByIdAndUpdate(productId, { ratingsAverage: 0, ratingsCount: 0 });
  }
};

module.exports = mongoose.model('Product', productSchema);
