const {  Register, socialRegister, Login, PhoneVerfication } = require('../controllers/userAuthController')
const { call_user, verified_code } = require('../helpers/phoneverification')
const { validRegister, phoneValidator, validLogin } = require('../helpers/validator')
const { googleMidd, facebookMidd, isHumanValidation } = require('../middleware/social')


const Route = require('express').Router()




Route.post('/register',validRegister,Register)
Route.post('/register/google',googleMidd,socialRegister)
Route.post('/register/facebook',facebookMidd,socialRegister)
Route.post('/login',validLogin,Login)
Route.post('/phoneverification',phoneValidator,isHumanValidation,call_user)
Route.post('/verifycode',verified_code,PhoneVerfication)


module.exports=Route