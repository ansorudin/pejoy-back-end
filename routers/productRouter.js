const { getAllProduct } = require('../controllers/productController')

const Router = require('express').Router()

Router.get('/', getAllProduct)

module.exports = Router