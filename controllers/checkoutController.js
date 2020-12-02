const Axios = require('axios');
const db = require('./../database/mysql');
const query = require('./../database/mysqlAsync');;
const jwt = require('jsonwebtoken');

module.exports = {

    getUserCheckoutShippingAddress: (req, res) => {
        const data = req.body

        var sqlQuery = 'SELECT address_detail as Alamat, city as Kota, province as Provinsi, phone_number as Nomor_Telepon, receiver_name as Nama_Penerima FROM shipping_address WHERE users_id = ? And is_main_address = 1'
        db.query(sqlQuery, data.users_id, (err, result) => {
            try {
                if(err) throw err
                
                res.send({
                    error: false,
                    message: 'Get Users Shipping Address Success',
                    data: result
                })
            } catch (error) {
                res.send({
                    error: true,
                    message : error.message
                })
            }
        })
    },

    geMyOrders: (req, res) => {
        const data = req.body

        var sqlQuery = 'Select total_amount as Sub_total, shipping_rates as Shipping_Rates, (total_amount + shipping_rates) as Total from transaction where id = ?'
        db.query(sqlQuery, data.users_id, (err, result) => {
            try {
                if(err) throw err
                
                res.send({
                    error: false,
                    message: 'Get Users Orders Success',
                    data: result
                })
            } catch (error) {
                res.send({
                    error: true,
                    message : error.message
                })
            }
        })
    },
   


}