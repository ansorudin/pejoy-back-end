const {FacebookLogin, GoogleLogin, RegisterComtroller, LoginController, ForgotPassword, UpdatePassword } = require('../controllers/AuthController')
const { validationRegister } = require('../helpers/validate')
const Route = require('express').Router()


Route.post('/register', RegisterComtroller)
Route.post('/login', LoginController)
Route.post('/googlelogin', GoogleLogin)
Route.post('/facebooklogin', FacebookLogin)
Route.post('/forgotpassword', ForgotPassword)
Route.post('/update-password', UpdatePassword)




module.exports = Route