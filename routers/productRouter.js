const { getAllProduct, getFilter, getProductByCategory, getProductByRating, getProductDetail } = require('../controllers/productController')

const Router = require('express').Router()

Router.get('/', getAllProduct)
Router.get('/filter', getFilter)
Router.get('/:id', getProductDetail)
Router.post('/filter/category', getProductByCategory)


module.exports = Router