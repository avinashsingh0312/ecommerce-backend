const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { placeOrder } = require('../controllers/checkoutController');

const router = express.Router();

router.post('/checkout', authMiddleware, placeOrder);

module.exports = router;