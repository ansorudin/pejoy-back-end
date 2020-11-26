const { getAllProduct, getFilter, getProductByCategory, getProductByRating, getProductDetail } = require('../controllers/productController')

const Router = require('express').Router()

Router.get('/', getAllProduct)
Router.get('/filter', getFilter)
Router.get('/:id', getProductDetail)
Router.get('/filter/category', getProductByCategory)
Router.get('/filter/rating', getProductByRating)


module.exports = Router