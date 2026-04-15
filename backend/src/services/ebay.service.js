const axios = require('axios');
const Product = require('../models/Product');
const logger = require('../utils/logger');

// eBay category → our category mapping
const CATEGORY_MAP = {
  watches: {
    ebayKeyword: 'luxury watch',
    ebayCategoryId: '31387', // Wristwatches
    ourCategory: 'watches',
  },
  perfumes: {
    ebayKeyword: 'luxury perfume fragrance',
    ebayCategoryId: '180345', // Fragrances
    ourCategory: 'perfumes',
  },
  handbags: {
    ebayKeyword: 'designer handbag',
    ebayCategoryId: '169291', // Women's Bags & Handbags
    ourCategory: 'handbags',
  },
  jewelry: {
    ebayKeyword: 'fine jewelry diamond',
    ebayCategoryId: '281', // Jewelry & Watches
    ourCategory: 'jewelry',
  },
  apparel: {
    ebayKeyword: 'designer luxury clothing',
    ebayCategoryId: '11450', // Clothing, Shoes & Accessories
    ourCategory: 'apparel',
  },
};

const EBAY_BASE_URL =
  process.env.EBAY_ENV === 'sandbox'
    ? 'https://api.sandbox.ebay.com'
    : 'https://api.ebay.com';

let cachedToken = null;
let tokenExpiry = null;

/**
 * Get OAuth2 Application token (Client Credentials flow)
 */
const getAccessToken = async () => {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const credentials = Buffer.from(
    `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`
  ).toString('base64');

  const response = await axios.post(
    `${EBAY_BASE_URL}/identity/v1/oauth2/token`,
    'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  cachedToken = response.data.access_token;
  // Expire 5 minutes before actual expiry
  tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

  return cachedToken;
};

/**
 * Search eBay items using Browse API
 */
const searchEbayItems = async (keyword, categoryId, limit = 10) => {
  const token = await getAccessToken();

  const response = await axios.get(`${EBAY_BASE_URL}/buy/browse/v1/item_summary/search`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': 'EBAY_IN', // India marketplace
      'X-EBAY-C-ENDUSERCTX': 'contextualLocation=country%3DIN',
    },
    params: {
      q: keyword,
      category_ids: categoryId,
      limit,
      filter: 'conditionIds:{1000|1500|2000|2500|3000},buyingOptions:{FIXED_PRICE}',
      sort: 'price',
      fieldgroups: 'EXTENDED',
    },
  });

  return response.data.itemSummaries || [];
};

/**
 * Convert eBay item to our Product schema
 */
const mapEbayItemToProduct = (item, ourCategory) => {
  const priceValue = parseFloat(item.price?.value || 0);
  // Convert USD to INR (approximate rate)
  const inrPrice = Math.round(priceValue * 83);

  const image = item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl || '';
  const additionalImages = (item.additionalImages || []).slice(0, 4).map((img) => ({
    url: img.imageUrl,
    publicId: `ebay_${item.itemId}_${Math.random().toString(36).substr(2, 5)}`,
    alt: item.title,
  }));

  const images = image
    ? [
        { url: image, publicId: `ebay_${item.itemId}`, alt: item.title },
        ...additionalImages,
      ]
    : additionalImages;

  if (images.length === 0) return null;

  return {
    name: item.title?.substring(0, 120) || 'Luxury Item',
    description: item.shortDescription || item.title || 'Premium luxury item sourced from eBay marketplace.',
    shortDescription: item.title?.substring(0, 300),
    brand: item.seller?.username || extractBrand(item.title) || 'Premium Brand',
    category: ourCategory,
    price: inrPrice || 999,
    stock: item.estimatedAvailabilities?.[0]?.estimatedAvailableQuantity || 10,
    isFeatured: true,
    isActive: true,
    images,
    tags: ['ebay', ourCategory, 'luxury'],
    specifications: [
      { key: 'Condition', value: item.condition || 'New' },
      { key: 'Location', value: item.itemLocation?.country || 'International' },
      { key: 'Source', value: 'eBay Marketplace' },
    ],
    ebayItemId: item.itemId,
    ebayUrl: item.itemWebUrl,
  };
};

/**
 * Try to extract brand from title
 */
const extractBrand = (title = '') => {
  const luxuryBrands = [
    'Rolex', 'Omega', 'Cartier', 'Chanel', 'Gucci', 'Louis Vuitton', 'Prada',
    'Hermès', 'Burberry', 'Versace', 'Armani', 'Dior', 'Tiffany', 'Bulgari',
    'Tag Heuer', 'Breitling', 'IWC', 'Patek Philippe', 'Audemars Piguet',
  ];
  for (const brand of luxuryBrands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) return brand;
  }
  return null;
};

/**
 * Sync eBay products into MongoDB for a given category
 */
const syncCategory = async (categoryKey, limit = 8) => {
  const config = CATEGORY_MAP[categoryKey];
  if (!config) throw new Error(`Unknown category: ${categoryKey}`);

  logger.info(`Syncing eBay products for category: ${categoryKey}`);

  const items = await searchEbayItems(config.ebayKeyword, config.ebayCategoryId, limit);
  logger.info(`Fetched ${items.length} items from eBay for ${categoryKey}`);

  let created = 0;
  let skipped = 0;

  for (const item of items) {
    const productData = mapEbayItemToProduct(item, config.ourCategory);
    if (!productData) { skipped++; continue; }

    // Upsert by ebayItemId to avoid duplicates on re-sync
    await Product.findOneAndUpdate(
      { ebayItemId: item.itemId },
      productData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    created++;
  }

  logger.info(`Category ${categoryKey}: ${created} upserted, ${skipped} skipped`);
  return { created, skipped };
};

/**
 * Sync all categories
 */
const syncAllCategories = async (limitPerCategory = 8) => {
  const results = {};
  for (const key of Object.keys(CATEGORY_MAP)) {
    try {
      results[key] = await syncCategory(key, limitPerCategory);
    } catch (err) {
      logger.error(`Failed to sync category ${key}: ${err.message}`);
      results[key] = { error: err.message };
    }
  }
  return results;
};

module.exports = { syncAllCategories, syncCategory, getAccessToken };
