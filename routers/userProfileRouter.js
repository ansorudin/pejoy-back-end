const express = require('express');
const Router = express.Router();
const userProfileController = require('./../controllers/userProfileController');

Router.post('/profile', userProfileController.getDataUsers)
Router.post('/shipping-address', userProfileController.getUserShippingAddress)
Router.post('/shipping-address/add-address', userProfileController.addShippingAddress)
Router.get('/shipping-address/get-raja-ongkir-province', userProfileController.getRajaOngkirProvince)
Router.get('/shipping-address/get-raja-ongkir-city', userProfileController.getRajaOngkirCity)
Router.post('/shipping-address/edit-address', userProfileController.getUsersShippingAddressToEdit)
Router.post('/shipping-address/update-address', userProfileController.updateUsersShippingAddress)
Router.delete('/shipping-address/delete-address/:idAddress/:idUsers', userProfileController.deleteUsersShippingAddress)
Router.get('/admin-dashboard/warehouse-inventory', userProfileController.getWarehouseInventory)
Router.get('/admin-dashboard/flash-sale/get-products-discount', userProfileController.getDiscountProducts)
Router.post('/admin-dashboard/flash-sale/create-flash-sale-event', userProfileController.createFlashSaleEvent)

module.exports = Router