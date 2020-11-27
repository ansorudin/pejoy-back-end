const { getAllProduct, getFilter, getProductByCategory, getProductByMultipleCategory, getProductDetail } = require('../controllers/productController')

const Router = require('express').Router()

Router.get('/', getAllProduct)
Router.get('/filter', getFilter)
Router.get('/:id', getProductDetail)
Router.post('/filter/category', getProductByCategory)
Router.post('/filter/multi-category', getProductByMultipleCategory)



module.exports = Router