const axios = require("axios");

const getEbayToken = async () => {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await axios.post(
    "https://api.ebay.com/identity/v1/oauth2/token",
    "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
    }
  );

  return response.data.access_token;
};

const fetchProducts = async (query) => {
  const token = await getEbayToken();

  const res = await axios.get(
    `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${query}&limit=8`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.itemSummaries;
};

module.exports = { fetchProducts };
