const express = require("express");
const {
  getProducts,
  addProduct,
  deleteAllProducts,
} = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getProducts);
router.post("/", authMiddleware, addProduct);
router.delete("/", authMiddleware, deleteAllProducts);

module.exports = router;
