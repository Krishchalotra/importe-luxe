require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  {
    name: 'Royal Oak Chronograph',
    description: 'A masterpiece of haute horlogerie combining precision engineering with iconic octagonal bezel design. Water resistant to 50m with sapphire crystal glass.',
    shortDescription: 'Iconic octagonal bezel with precision chronograph movement',
    brand: 'Audemars Piguet',
    category: 'watches',
    price: 45000,
    discountPrice: 42000,
    stock: 5,
    isFeatured: true,
    tags: ['luxury', 'chronograph', 'swiss'],
    specifications: [
      { key: 'Movement', value: 'Automatic Cal. 2385' },
      { key: 'Case', value: 'Stainless Steel 41mm' },
      { key: 'Water Resistance', value: '50 meters' },
    ],
    images: [{ url: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80', publicId: 'watch1', alt: 'Royal Oak Chronograph' }],
  },
  {
    name: 'Submariner Date',
    description: 'The reference among divers watches since 1953. Waterproof to 300 metres, featuring the iconic Oyster case and unidirectional rotatable bezel.',
    shortDescription: 'Iconic diver\'s watch waterproof to 300 metres',
    brand: 'Rolex',
    category: 'watches',
    price: 14500,
    stock: 4,
    isFeatured: true,
    tags: ['luxury', 'diver', 'swiss'],
    specifications: [
      { key: 'Movement', value: 'Automatic Cal. 3235' },
      { key: 'Case', value: 'Oystersteel 41mm' },
      { key: 'Water Resistance', value: '300 meters' },
    ],
    images: [{ url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80', publicId: 'watch2', alt: 'Rolex Submariner' }],
  },
  {
    name: 'Bleu de Chanel Parfum',
    description: 'An aromatic-woody fragrance for men. A scent of freedom that expresses the ideal of a man who chooses his own destiny. Fresh, clean and deeply sensual.',
    shortDescription: 'Aromatic-woody fragrance with citrus and sandalwood notes',
    brand: 'Chanel',
    category: 'perfumes',
    price: 320,
    stock: 30,
    isFeatured: true,
    tags: ['luxury', 'fragrance', 'men'],
    specifications: [
      { key: 'Volume', value: '100ml' },
      { key: 'Concentration', value: 'Parfum' },
      { key: 'Notes', value: 'Citrus, Sandalwood, Amber' },
    ],
    images: [{ url: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80', publicId: 'perfume1', alt: 'Bleu de Chanel' }],
  },
  {
    name: 'N°5 Eau de Parfum',
    description: 'The world\'s most iconic fragrance. A floral aldehyde with notes of ylang-ylang, rose, jasmine and sandalwood. Created in 1921, timeless forever.',
    shortDescription: 'The world\'s most iconic floral aldehyde fragrance',
    brand: 'Chanel',
    category: 'perfumes',
    price: 280,
    stock: 25,
    isFeatured: true,
    tags: ['luxury', 'fragrance', 'women', 'iconic'],
    specifications: [
      { key: 'Volume', value: '100ml' },
      { key: 'Concentration', value: 'Eau de Parfum' },
      { key: 'Notes', value: 'Ylang-ylang, Rose, Jasmine, Sandalwood' },
    ],
    images: [{ url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', publicId: 'perfume2', alt: 'Chanel No5' }],
  },
  {
    name: 'Monogram Canvas Tote',
    description: 'The iconic Louis Vuitton monogram canvas tote. Crafted from coated canvas with leather trim, brass hardware and textile lining. A timeless investment piece.',
    shortDescription: 'Iconic monogram canvas with leather trim and brass hardware',
    brand: 'Louis Vuitton',
    category: 'handbags',
    price: 1850,
    discountPrice: 1650,
    stock: 8,
    isFeatured: true,
    tags: ['luxury', 'handbag', 'monogram'],
    specifications: [
      { key: 'Material', value: 'Coated Canvas & Leather' },
      { key: 'Dimensions', value: '40 x 34 x 19 cm' },
      { key: 'Hardware', value: 'Polished Brass' },
    ],
    images: [{ url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80', publicId: 'bag1', alt: 'Monogram Tote' }],
  },
  {
    name: 'Diamond Solitaire Ring',
    description: 'A breathtaking 2-carat round brilliant diamond set in platinum. GIA certified, VS1 clarity, D color. The ultimate symbol of eternal love and luxury.',
    shortDescription: '2-carat GIA certified diamond in platinum setting',
    brand: 'Tiffany & Co',
    category: 'jewelry',
    price: 28000,
    stock: 3,
    isFeatured: true,
    tags: ['luxury', 'diamond', 'ring'],
    specifications: [
      { key: 'Diamond', value: '2.0 Carat Round Brilliant' },
      { key: 'Clarity', value: 'VS1' },
      { key: 'Metal', value: 'Platinum 950' },
    ],
    images: [{ url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80', publicId: 'ring1', alt: 'Diamond Ring' }],
  },
  {
    name: 'Cashmere Overcoat',
    description: 'Impeccably tailored from the finest Scottish cashmere. A double-breasted silhouette with peak lapels and hand-stitched details. The pinnacle of sartorial elegance.',
    shortDescription: 'Double-breasted Scottish cashmere with hand-stitched details',
    brand: 'Burberry',
    category: 'apparel',
    price: 3200,
    discountPrice: 2800,
    stock: 12,
    isFeatured: true,
    tags: ['luxury', 'cashmere', 'coat'],
    specifications: [
      { key: 'Material', value: '100% Scottish Cashmere' },
      { key: 'Fit', value: 'Regular' },
      { key: 'Care', value: 'Dry Clean Only' },
    ],
    images: [{ url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80', publicId: 'coat1', alt: 'Cashmere Overcoat' }],
  },
  {
    name: 'Oxford Leather Derby',
    description: 'Hand-crafted in Northampton from full-grain calf leather. Goodyear welted construction ensures decades of wear. The definitive dress shoe for the discerning gentleman.',
    shortDescription: 'Hand-crafted full-grain calf leather with Goodyear welt',
    brand: 'John Lobb',
    category: 'footwear',
    price: 1200,
    stock: 10,
    isFeatured: false,
    tags: ['luxury', 'shoes', 'leather'],
    specifications: [
      { key: 'Material', value: 'Full-grain Calf Leather' },
      { key: 'Construction', value: 'Goodyear Welted' },
      { key: 'Origin', value: 'Northampton, England' },
    ],
    images: [{ url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80', publicId: 'shoe1', alt: 'Oxford Derby' }],
  },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Product.deleteMany({});
  console.log('Cleared existing products');

  const created = await Product.insertMany(products);
  console.log(`Seeded ${created.length} products successfully`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
