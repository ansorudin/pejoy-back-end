const validator = require('validator')
const query = require('../database/mysqlAsync')
const fs = require('fs')
const handlebars = require('handlebars')
const hashPassword = require('./../helpers/hashPassword')
const jwt = require('jsonwebtoken')
const transporter = require('./../helpers/transporter')
const {OAuth2Client} = require('google-auth-library')
const db = require('./../database/mysql')
const fetch = require("node-fetch");

const client = new OAuth2Client('484227442752-uv4bai641h7vdjl9g83amlk46nq4alqa.apps.googleusercontent.com')

const RegisterComtroller = async (req, res) => {
    const data = req.body // {email, password}
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/

    const userExistQuery =  'select * from users where email = ?'
    const storeToDbUser = 'insert into users set ?'
    const storeToDbDetailUser = 'insert into user_detail set ?'

    try {
        if(!data.email || !data.password || !data.username) throw 'Data not complete'
        if(!(validator.isEmail(data.email))) throw 'Email format wrong'
        if(!(re.test(data.password))) throw 'Password must contain at least one uppercase letter, one lowercase letter and one number'
        if(data.username.length <= 3 || data.username.length >= 32 ) throw 'Username min 3 character and maximal 32 character'

        const passwordHashed = hashPassword(data.password)
        data.password = passwordHashed

        try {
            const userExist = await query(userExistQuery,data.email)
            .catch(error => {
                throw error
            })
            if(userExist.length !== 0) throw 'Email sudah terdaftar'

            const resultToUserDetail = await query(storeToDbDetailUser, {user_name : data.username})
            .catch(error => {
                throw error
            })

            let user_detail_id = resultToUserDetail.insertId
            const resultToUsers = await query(storeToDbUser, {email : data.email, password : data.password, user_detail_id : user_detail_id})
            .catch(error => {
                throw error
            })


            const token = jwt.sign({id:resultToUsers.insertId},process.env.SECRET_KEY,{expiresIn:'30d'})
            const tokenForVerified = jwt.sign({password : data.password},process.env.SECRET_KEY,{expiresIn:'1d'})

            fs.readFile('/Users/macbookpro/Documents/Purwadhika/pejoy/pejoy-back-end/template/confirmation.html',
            {encoding : 'utf-8'}, (err, file) => {
                if(err) throw err
                const template = handlebars.compile(file)
                const resultTemplate = template({
                    userName : data.username,
                    link : `http://localhost:3000/verification?id=` + tokenForVerified
                })
                transporter.sendMail({
                    from : "admin",
                    subject : "email verification",
                    to : data.email,
                    html : resultTemplate
                })
                .then((respon) => {
                    res.send({
                        error : false,
                        message : "register Succes, email alerady sent !",
                        token : token,
                        role : 0
                    })
                })
                .catch((err) => {
                    res.send({
                        error: true,
                        message : err.message
                    })
                })
            })
            
            
        } catch (error) {
            res.send({
                error : true,
                message : error
            })
        }

    } catch (error) {
        res.send({
            error : true,
            message : error
        })
    }
}

const LoginController = async (req, res) => {
    const data = req.body // {email, password}

    const passwordHashed = hashPassword(data.password)
    data.password = passwordHashed
    const userLoginQuery = 'select * from users where email = ? and password = ?;'

    try {
        if(!data.email || !data.password) throw 'Data not complete'
        const resultUserLogin = await query(userLoginQuery, [data.email, data.password])
        .catch(error => {
            throw error
        })

        if(resultUserLogin.length === 0) throw 'Email tidak terdaftar atau Password salah!'
        const token = jwt.sign({id:resultUserLogin[0].id},process.env.SECRET_KEY,{expiresIn:'30d'})
        res.send({
            error : false,
            message : 'Login succes',
            token : token,
            role : resultUserLogin[0].user_role
        })
    } catch (error) {
        res.send({
            error : true,
            message : error
        })
    }
}

const GoogleLogin = (req, res) => {
    const {idToken} = req.body
    // Get token from request

    // Verify token
    try {
        if(idToken){
            client.verifyIdToken({idToken, audience : '484227442752-uv4bai641h7vdjl9g83amlk46nq4alqa.apps.googleusercontent.com'})
            .then(response => {
                const {
                    email_verified,
                    name,
                    email
                } = response.payload
        
                // check if email verified
                if(email_verified){
                    // find from db users email yg diberikan google
                    db.query('select * from users where email = ?', email, (err, result) => {
                        try {
                            if(err) throw err
                            if(result.length !== 0){
                                // if user exist
                                const token = jwt.sign({id:result[0].id},process.env.SECRET_KEY,{expiresIn:'30d'})
                                res.send({
                                    error : false,
                                    message : 'Login succes',
                                    token : token,
                                    role : result[0].user_role
                                })
                            }else{
                                // if user not exist store to database and generate password cz password in db not null
                                let password = email + process.env.SECRET_KEY
        
                                // store to detail user
                                db.query('insert into user_detail set ?', {user_name : name}, (err, resultDetail) => {
                                    try {
                                        if(err) throw err
                                        
                                        // if not error
                                        db.query('insert into users set ?', {email : email, password : password, user_detail_id : resultDetail.insertId }, (err, resultUser) => {
                                            try {
                                                if(err) throw err
                                                const token = jwt.sign({id:resultUser.insertId},process.env.SECRET_KEY,{expiresIn:'30d'})
                                                res.send({
                                                    error : false,
                                                    message : 'Login succes',
                                                    token : token
                                                })
        
                                            } catch (error) {
                                                res.send({
                                                    error : true,
                                                    message : error
                                                })
                                            }
                                        })
                                    } catch (error) {
                                        res.send({
                                            error : true,
                                            message : error
                                        })
                                    }
                                })
                            }
                        } catch (error) {
                            res.send({
                                error : true,
                                message : error
                            })
                        }
                    })
                }else{
                    res.send({
                        error : true,
                        message : 'Google Login gagal. try again'
                    })
                }
            })
        }
    } catch (error) {
        res.send({
            error : true,
            message : error
        })
    }
}

const FacebookLogin = (req, res) => {
    const {userID, accessToken} = req.body

    const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;

    return (
        fetch(url, {
            method : 'GET'
        })
        .then(response => response.json())
        // .then(response => console.log(response))
        .then(response => {
            const {email, name} = response
            db.query('select * from users where email = ?', email, (err, result) => {
                try {
                    if(err) throw err
                    if(result.length !== 0){
                        // user exist
                        const token = jwt.sign({id:result[0].id},process.env.SECRET_KEY,{expiresIn:'30d'})
                        res.send({
                            error : false,
                            message : 'Login succes',
                            token : token,
                            role : result[0].user_role
                        })
                    }else{
                        let password = email + process.env.SECRET_KEY

                        db.query('insert into user_detail set ?', {user_name : name}, (err, resultDetail) => {
                            try {
                                if(err) throw err
                                
                                // if not error
                                db.query('insert into users set ?', {email : email, password : password, user_detail_id : resultDetail.insertId }, (err, resultUser) => {
                                    try {
                                        if(err) throw err
                                        const token = jwt.sign({id:resultUser.insertId},process.env.SECRET_KEY,{expiresIn:'30d'})
                                        res.send({
                                            error : false,
                                            message : 'Login with Facebook succes',
                                            token : token
                                        })

                                    } catch (error) {
                                        res.send({
                                            error : true,
                                            message : error
                                        })
                                    }
                                })
                            } catch (error) {
                                res.send({
                                    error : true,
                                    message : error
                                })
                            }
                        })
                        
                        
                    }
                } catch (error) {
                    res.send({
                        error : true,
                        message : error
                    })
                }
            })
        })
        .catch((error) => {
            res.send({
                error : true,
                message : 'Facebook login gagal'
            })
        })
    )
}

const ForgotPassword = (req, res) => {
    const {email} = req.body

    try {
        if(!email) throw new Error('Email tidak boleh kosong')
        db.query('select * from users where email = ?', email, (err, result) => {
            try {
                if(err) throw err
                if(result.length === 0) throw 'Email tidak terdaftar'

                const tokenForgotPassword = jwt.sign({email : email},process.env.SECRET_KEY,{expiresIn:'4h'})

                fs.readFile('/Users/macbookpro/Documents/Purwadhika/pejoy/pejoy-back-end/template/email.html',
                {encoding : 'utf-8'}, (err, file) => {
                if(err) throw err
                const template = handlebars.compile(file)
                const resultTemplate = template({
                    userName : email,
                    link : `http://localhost:3000/update-password/` + tokenForgotPassword
                })
                transporter.sendMail({
                    from : "admin",
                    subject : "email verification",
                    to : email,
                    html : resultTemplate
                })
                .then((respon) => {
                    res.send({
                        error : false,
                        message : "email alerady sent !",
                    })
                })
                .catch((err) => {
                    res.send({
                        error: true,
                        message : err.message
                    })
                })
            })
                
            } catch (error) {
                res.send({
                    error : true,
                    message : error
                })
            }
        })
    } catch (error) {
        res.send({
            error : true,
            message : error
        })
    }
}

const UpdatePassword = (req, res) => {
    const {email, password} = req.body

    const passwordHashed = hashPassword(password)
    try {
        if(!email || !password) throw 'Data not complete'
        jwt.verify(email, process.env.SECRET_KEY, (err, dataToken) => {
            try {
                if(err) throw err
                let emailUser = dataToken.email
                db.query(`update users set password = ? where email = ?;`,[passwordHashed, emailUser], (err, result) => {
                    try {
                        if(err) throw err
                        res.send({
                            error : false,
                            message : 'update password success'
                        })
                    } catch (error) {
                        res.send({
                            error : true,
                            message : error
                        })
                    }
                })
            } catch (error) {
                res.send({
                    error : true,
                    message : error
                })
            }
        })

    } catch (error) {
        res.send({
            error : true,
            message : error
        })
    }

    
}


module.exports = {
    RegisterComtroller,
    LoginController,
    GoogleLogin,
    FacebookLogin,
    ForgotPassword,
    UpdatePassword
}