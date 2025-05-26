const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const { generateToken } = require('../config/jwt');

describe('Auth API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  let token;

  test('Signup', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      username: 'testuser',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  test('Signup', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      username: 'testuser',
      password: 'password123',
    });

    expect(res.status).toBe(400);
  });

  test('Login', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'testuser',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test('Login fail with incorrect credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'testuser',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid credentials');
  });

  test('Logout successfully', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logged out successfully');
  });

  test('Logout fail without token', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Token required');
  });
});
