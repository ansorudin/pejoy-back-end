const jwt = require('jsonwebtoken')

const jwtVerify = (req, res, next) => {
    const token = req.body.token
    console.log(token)
    
    if(!token) return res.json({
        error : true,
        message : 'Token Not Found'
    })

    jwt.verify(token, process.env.SECRET_KEY, (err, dataToken) => {
        try {
            if(err) throw err
            req.dataToken = dataToken
            next()
        } catch (error) {
            res.json({
                error : true,
                message : error.message,
                detail : error
            })
        }
    })
}

module.exports = jwtVerify