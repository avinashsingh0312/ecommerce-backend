const request = require('supertest');
const express = require('express');
const authMiddleware = require('./authMiddleware');
const { verifyToken } = require('../config/jwt');
const { blacklistedTokens } = require('../controllers/authController');

jest.mock('../config/jwt', () => ({
  verifyToken: jest.fn(),
}));

jest.mock('../controllers/authController', () => ({
  blacklistedTokens: [],
}));


const app = express();
app.use(express.json());


app.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Access granted', user: req.user });
});

describe('Auth Middleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return 401 if token is missing', async () => {
    const response = await request(app).get('/protected');
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Access denied');
  });

  test('should return 401 if token is blacklisted', async () => {
    blacklistedTokens.push('blacklistedToken123'); 

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer blacklistedToken123');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('User is sign out');
  });

  test('should return 400 if token is invalid', async () => {
    verifyToken.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalidToken123');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid token');
  });

  test('should allow access if token is valid', async () => {
    verifyToken.mockReturnValue({ id: 'user123', name: 'John Doe' });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer validToken123');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Access granted');
    expect(response.body.user).toEqual({ id: 'user123', name: 'John Doe' });
  });
});
