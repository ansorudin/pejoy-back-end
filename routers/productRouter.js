const { getAllProduct, getFilter, getProductByCategory, getProductByMultipleCategory, getProductDetail, getCart, getEstimatedOngkir } = require('./../controllers/productController')
const generateToken = require('../helpers/generateJwt')
const jwtVerify = require('../middleware/jwt')

const Router = require('express').Router()

Router.get('/', getAllProduct)
Router.get('/filter', getFilter)
Router.get('/:id', getProductDetail)
Router.post('/filter/category', getProductByCategory)
Router.post('/filter/multi-category', getProductByMultipleCategory)
Router.post('/cart', jwtVerify, getCart)
Router.get('/generate-token/:id', generateToken)
Router.post('/estimated-ongkir/all',jwtVerify, getEstimatedOngkir)



module.exports = Router