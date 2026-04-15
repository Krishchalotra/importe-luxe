const express = require("express");
const router = express.Router();
const { fetchProducts } = require("../services/ebay");

router.get("/products", async (req, res) => {
  try {
    const query = req.query.q || "watches";
    const products = await fetchProducts(query);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch eBay products" });
  }
});

module.exports = router;
