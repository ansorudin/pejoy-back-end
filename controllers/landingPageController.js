const db = require('./../database/mysql');
const jwt = require('jsonwebtoken');

module.exports = {
    getAllFlashSaleProducts: (req, res) => {
        var sqlQuery = `SELECT p.name AS name, MIN(vp.price) AS price, p.discount AS discount, SUM(s.stock_customer) AS stock_products_in_all_warehouse, GROUP_CONCAT(DISTINCT(ip.url)) AS url FROM products p
        JOIN variant_product vp ON vp.products_id = p.id
        JOIN stock s ON s.variant_product_id = vp.id
        JOIN image_product ip ON ip.products_id = p.id
        WHERE p.is_flash_sale = 1
        GROUP BY p.id
        HAVING stock_products_in_all_warehouse > 0;`
        db.query(sqlQuery, (err, result) => {
            try {
                if(err) throw err

                res.send({
                    error: false,
                    message: 'Get All Flash Sale Products Success',
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

    getAllBestSellerProducts: (req, res) => {
        var sqlQuery = `SELECT p.id, p.name, vp.products_id, vp.price, SUM(td.qty) AS total_sold, p.discount, ip.url FROM transaction_detail td
        JOIN variant_product vp ON td.variant_product_id = vp.id
        JOIN products p ON vp.products_id = p.id
        JOIN image_product ip ON vp.products_id = ip.products_id
        WHERE transaction_id IN
        (SELECT transaction_id FROM status_transaction WHERE status_name_id = 3) GROUP BY products_id ORDER BY total_sold DESC;`
        db.query(sqlQuery, (err, result) => {
            try {
                if(err) throw err

                res.send({
                    error: false,
                    message: 'Get All Best Seller Products Success',
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
