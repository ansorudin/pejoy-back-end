const express = require('express');
const Router = express.Router();
const userProfileController = require('./../controllers/userProfileController');

Router.post('/shipping-address', userProfileController.getUserShippingAddress)
Router.post('/shipping-address/add-address', userProfileController.addShippingAddress)
Router.get('/admin-dashboard/flash-sale/get-products-discount', userProfileController.getAllProductsOnAdminDashboard)
Router.post('/admin-dashboard/flash-sale/create-flash-sale-event', userProfileController.createFlashSaleEvent)

module.exports = Router