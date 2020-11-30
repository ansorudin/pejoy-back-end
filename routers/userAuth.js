const {  Register, socialRegister, Login } = require('../controllers/userAuthController')
const { validRegister } = require('../helpers/validator')
const { googleMidd, facebookMidd } = require('../middleware/social')


const Route = require('express').Router()




Route.post('/register',validRegister,Register)
Route.post('/register/google',googleMidd,socialRegister)
Route.post('/register/facebook',facebookMidd,socialRegister)
Route.post('/login',Login)


module.exports=Route