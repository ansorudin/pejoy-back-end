const express = require('express');
const Router = express.Router();
const checkoutController = require('./../controllers/checkoutController');


Router.post('/checkout-shipping-address', checkoutController.getUserCheckoutShippingAddress)
Router.post('/checkout-Myorders', checkoutController.geMyOrders)

module.exports = Router
