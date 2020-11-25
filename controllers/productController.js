const { all } = require('../routers/productRouter')
const query = require('./../database/mysqlAsync')

const getAllProduct = async (req, res) => {
    let getAllProductQuery = `select sum(s.stock_customer) as stock_all_gudang ,group_concat(distinct(ip.url)) as url  ,p.name, c.category_name, min(vp.price) as price,  b.brands_name from products p
    join variant_product vp on vp.products_id = p.id
    join brands b on b.id = p.brands_id
    join stock s on s.variant_product_id = vp.id
    join category c on c.id = p.category_id
    join image_product ip on ip.products_id = p.id
    group by p.id
    having stock_all_gudang > 0;`

    try {
        const allProduct = await query(getAllProductQuery)

        let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) != index)
        
        let arrCategory = allProduct.map((val,index) => {
            return val.category_name
        })
        let arrBrands = allProduct.map((val, index) => {
            return val.brands_name
        })

        let category = [...new Set(findDuplicates(arrCategory))]
        let brands = [...new Set(findDuplicates(arrBrands))]
        
        res.send({
            error : false,
            allProduct,
            category,
            brands
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