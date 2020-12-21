const {FacebookLogin, GoogleLogin, RegisterComtroller, LoginController } = require('../controllers/AuthController')
const { validationRegister } = require('../helpers/validate')
const Route = require('express').Router()


Route.post('/register', RegisterComtroller)
Route.post('/login', LoginController)
Route.post('/googlelogin', GoogleLogin)
Route.post('/facebooklogin', FacebookLogin)




module.exports = Route