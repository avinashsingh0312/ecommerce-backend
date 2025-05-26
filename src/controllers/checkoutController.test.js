const request = require("supertest");
const express = require("express");
const { placeOrder } = require("../controllers/checkoutController");
const Cart = require("../models/Cart");
const Order = require("../models/Order");

jest.mock("../models/Cart");
jest.mock("../models/Order");

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  req.user = { id: "user123" };
  next();
});

app.post("/checkout", placeOrder);

describe("POST /checkout (Place Order)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("cart is empty", async () => {
    Cart.findOne.mockResolvedValue(null);

    const response = await request(app).post("/checkout");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Cart is empty" });
    expect(Cart.findOne).toHaveBeenCalledWith({ userId: "user123" });
  });

  it("no products", async () => {
    Cart.findOne.mockResolvedValue({ products: [] });

    const response = await request(app).post("/checkout");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Cart is empty" });
    expect(Cart.findOne).toHaveBeenCalledWith({ userId: "user123" });
  });

  it("order successfully", async () => {
    const mockCart = {
      userId: "user123",
      products: [{ name: "Laptop", price: 1000 }],
      totalPrice: 1000,
    };

    const mockOrder = {
      _id: "order123",
      userId: "user123",
      totalPrice: 1000,
      paymentStatus: "Paid",
    };

    Cart.findOne.mockResolvedValue(mockCart);
    Order.prototype.save = jest.fn().mockResolvedValue(mockOrder);
    Cart.findOneAndDelete.mockResolvedValue(null);

    const response = await request(app).post("/checkout");

    expect(response.status).toBe(201);
    expect(Cart.findOne).toHaveBeenCalledWith({ userId: "user123" });
    expect(Order.prototype.save).toHaveBeenCalled();
    expect(Cart.findOneAndDelete).toHaveBeenCalledWith({ userId: "user123" });
  });

  it("Server error", async () => {
    Cart.findOne.mockRejectedValue(new Error("Database error"));

    const response = await request(app).post("/checkout");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Database error" });
  });
});
