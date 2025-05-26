const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const { generateToken } = require('../config/jwt');

describe('Cart API', () => {
  let user, token, product;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    user = new User({ username: 'testuser111', password: 'password123' });
    await user.save();
    token = generateToken(user._id);

    product = new Product({ name: 'Test Product', price: 100,  category: 'Electronics' });
    await product.save();
  });

  afterAll(async () => {
    await Cart.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  test('Add to Cart', async () => {
    const res = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id, quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.products.length).toBe(1);
    expect(res.body.totalPrice).toBe(200);
  });

  test('Add to Cart', async () => {
    await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id, quantity: 3 });

    const cart = await Cart.findOne({ userId: user._id });
    expect(cart.products[0].quantity).toBe(5);
    expect(cart.totalPrice).toBe(500);
  });

  test('Remove from Cart', async () => {
    const res = await request(app)
      .post('/api/cart/remove')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id, quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.products[0].quantity).toBe(3);
    expect(res.body.totalPrice).toBe(300);
  });

  test('Remove from Cart', async () => {
    await request(app)
      .post('/api/cart/remove')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id, quantity: 3 });

    const cart = await Cart.findOne({ userId: user._id });
    expect(cart.products.length).toBe(0);
    expect(cart.totalPrice).toBe(0);
  });

  test('Remove from Cart', async () => {
    const res = await request(app)
      .post('/api/cart/remove')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id, quantity: 1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Product not found in cart');
  });
});
