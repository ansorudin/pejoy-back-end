const query = require('./../database/mysqlAsync')

const getAllProduct = async (req, res) => {
    let getAllProductQuery = `select * from products p
    join variant_product vp on vp.products_id = p.id
    join stock s on s.variant_product_id = vp.id
    where s.stock_customer > 0
    group by p.id;`

    try {
        const allProduct = await query(getAllProductQuery)
        res.send({
            error : false,
            allProduct
        })
    } catch (error) {
        res.send({
            error: true,
            message : error.message
        })
    }
}

module.exports = {
    getAllProduct
}