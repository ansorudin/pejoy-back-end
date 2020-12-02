const { getAllProduct, getFilter, getProductByCategory, getProductByMultipleCategory, getProductDetail, getCart, getEstimatedOngkir, addCart, deleteCart, updateQty, addTransaction } = require('./../controllers/productController')
const generateToken = require('../helpers/generateJwt')
const jwtVerify = require('../middleware/jwt')
const sort = require('../helpers/Sort')

const Router = require('express').Router()

Router.get('/', getAllProduct)
Router.get('/filter', getFilter)
Router.get('/:id', getProductDetail)
Router.post('/filter/category', getProductByCategory)
Router.post('/filter/multi-category', getProductByMultipleCategory)
Router.post('/cart', jwtVerify, getCart)
Router.get('/generate-token/:id', generateToken)
Router.post('/estimated-ongkir/all',jwtVerify, getEstimatedOngkir)
Router.post('/cart/add-to-cart', jwtVerify, addCart)
Router.delete('/cart/delete-cart/:id', deleteCart)
Router.patch('/cart/update-cart', jwtVerify, updateQty)
Router.post('/transaction/add-transaction', jwtVerify ,addTransaction)



module.exports = Router