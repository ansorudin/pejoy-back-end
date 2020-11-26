const express = require('express');
const Router = express.Router();
const userProfileController = require('./../controllers/userProfileController');

Router.post('/shipping-address', userProfileController.getUserShippingAddress)
Router.post('/shipping-address/add-address', userProfileController.addShippingAddress)
Router.get('/admin-dashboard/flash-sale', userProfileController.getAllProductsOnAdminDashboard)

module.exports = Router