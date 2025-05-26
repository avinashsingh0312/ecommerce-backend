const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  addToCart,
  removeFromCart,
  getCart,
  updateCart,
  deleteFromCart,
} = require("../controllers/cartController");

const router = express.Router();

router.post("/add", authMiddleware, addToCart);
router.post("/remove", authMiddleware, removeFromCart);
router.get("/cart", authMiddleware, getCart);
router.post("/update", authMiddleware, updateCart);
router.post("/delete", authMiddleware, deleteFromCart);

module.exports = router;
