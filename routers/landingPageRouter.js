const express = require('express');
const Router = express.Router();
const landingPageController = require('./../controllers/landingPageController');

Router.get('/products-flash-sale', landingPageController.getAllProductsFlashSale)

module.exports = Router