const db = require('./../database/mysql');
const jwt = require('jsonwebtoken');

module.exports = {
    getAllProductsFlashSale: (req, res) => {
        var sqlQuery = 'SELECT * FROM products where is_flash_sale = 1'
        db.query(sqlQuery, (err, result) => {
            try {
                if(err) throw err

                res.send({
                    error: false,
                    message: 'Get All Products Flash Sale Success',
                    data: result
                })
            } catch (error) {
                res.send({
                    error: true,
                    message : error.message
                })
            }
        })
    }
}
