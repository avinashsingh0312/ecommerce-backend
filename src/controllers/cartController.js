const Cart = require("../models/Cart");
const Product = require("../models/Product");

const addToCart = async (req, res) => {
  let { productId, quantity } = req.body;
  quantity = parseInt(quantity);
  const userId = req.user.id;

  try {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, products: [] });

    const productIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId
    );
    if (productIndex >= 0) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ productId, quantity });
    }

    cart.totalPrice += product.price * quantity;
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const removeFromCart = async (req, res) => {
  let { productId, quantity } = req.body;
  quantity = parseInt(quantity);
  const userId = req.user.id;

  try {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    let cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("Cart not found");

    const productIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId
    );
    if (productIndex === -1) throw new Error("Product not found in cart");

    // Reduce quantity
    cart.products[productIndex].quantity -= quantity;

    // If quantity is now zero or less, remove product from cart
    if (cart.products[productIndex].quantity <= 0) {
      cart.products.splice(productIndex, 1);
    }

    // Update total price
    cart.totalPrice -= product.price * quantity;
    if (cart.totalPrice < 0) cart.totalPrice = 0;

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart) {
      return res.json({ products: [], totalPrice: 0 });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Assuming you have a Cart model and your cart is stored per user

const updateCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id; // assuming your auth middleware adds `req.user`

  try {
    if (quantity < 0) {
      return res.status(400).json({ error: "Quantity cannot be negative" });
    }

    // Find the user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Check if product exists in cart
    const productInCart = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!productInCart) {
      return res.status(404).json({ error: "Product not in cart" });
    }

    if (quantity === 0) {
      // Remove the product from cart
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
    } else {
      // Update the quantity
      productInCart.quantity = quantity;
    }

    await cart.save();
    res.json({ message: "Cart updated successfully", cart });
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const deleteFromCart = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    let cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("Cart not found");

    const productIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId
    );
    if (productIndex === -1) throw new Error("Product not found in cart");

    // Get the quantity before removing
    const quantity = cart.products[productIndex].quantity;

    // Remove the product from cart
    cart.products.splice(productIndex, 1);

    // Update total price
    cart.totalPrice -= product.price * quantity;
    if (cart.totalPrice < 0) cart.totalPrice = 0;

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  getCart,
  updateCart,
  deleteFromCart,
};
