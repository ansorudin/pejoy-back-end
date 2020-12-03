const nodemailer = require('nodemailer')

// create transporter email
const transporter = nodemailer.createTransport(
    {
        service : "gmail",
        auth : {
            user : "ahmadansorudin@gmail.com",
            pass : "qbrnvgiowvzuzueh"
        },
        tls : {
            rejectUnauthorized : false
        }
    }
)

module.exports = transporter