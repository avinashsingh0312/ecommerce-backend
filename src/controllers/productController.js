const Product = require("../models/Product");

// GET products
const getProducts = async (req, res) => {
  const { category, sort } = req.query;
  let query = {};
  if (category) query.category = category;
  let sortOptions = {};
  if (sort === "asc") sortOptions.price = 1;
  if (sort === "desc") sortOptions.price = -1;

  try {
    const products = await Product.find(query).sort(sortOptions);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST new product
const addProduct = async (req, res) => {
  const { name, category, price, imageUrl } = req.body;

  if (!name || !category || !price || !imageUrl) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newProduct = new Product({
      name,
      category,
      price,
      imageUrl,
    });

    await newProduct.save();

    res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteAllProducts = async (req, res) => {
  try {
    await Product.deleteMany({});
    res
      .status(200)
      .json({ message: "All products have been deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getProducts, addProduct, deleteAllProducts };
