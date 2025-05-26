const request = require('supertest');
const express = require('express');
const { getProducts } = require('../controllers/productController');
const Product = require('../models/Product');

const app = express();
app.use(express.json());
app.get('/products', getProducts);
jest.mock('../models/Product');

describe('get products tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Return all products', async () => {
    const mockProducts = [
      { _id: '1', name: 'Product A', category: 'Electronics', price: 100 },
      { _id: '2', name: 'Product B', category: 'Clothing', price: 50 }
    ];
    Product.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockProducts)
    });

    const response = await request(app).get('/products');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockProducts);
    expect(Product.find).toHaveBeenCalledWith({});
  });

  it('Handle errors', async () => {
    Product.find.mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error('Database error'))
    });

    const response = await request(app).get('/products');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Database error' });
  });
});
