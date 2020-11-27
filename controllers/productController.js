const categoryFilter = require('../helpers/filterCategory')
const buildConditions = require('../helpers/multipleFilter')
const { all } = require('../routers/productRouter')
const query = require('./../database/mysqlAsync')

const getAllProduct = async (req, res) => {
    let getAllProductQuery = `select p.id, sum(s.stock_customer) as stock_all_gudang , p.discount,pr.rating, p.is_flash_sale, group_concat(distinct(ip.url)) as url  ,p.name, c.category_name,c.id as category_id, min(vp.price) as price,  b.brands_name from products p
    join variant_product vp on vp.products_id = p.id
    join brands b on b.id = p.brands_id
    join stock s on s.variant_product_id = vp.id
    join category c on c.id = p.category_id
    join image_product ip on ip.products_id = p.id
    left join product_review pr on pr.products_id = p.id
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

const getFilter = async(req, res) => {
    let brandsQuery = 'select * from brands'
    let categoryQuery = 'select * from category;'
    let ratingQuery =`select rating from product_review group by rating order by rating;`
    let discountQuery = 'select discount from products group by discount order by discount;'

    try {
        let category = await query(categoryQuery)
        let brands = await query(brandsQuery)
        let rating = await query(ratingQuery)
        let discount = await query(discountQuery)


        res.send({
            error : false,
            category,
            brands,
            rating,
            discount
        })
        
    } catch (error) {
        res.send({
            error: true,
            message : error.message
        })
    }
}

const getProductByCategory = async(req, res) => {
    // id Category
    let filter = req.body
    
    let conditions = categoryFilter(filter)

    let getProductCategoryQuery = `select p.id, sum(s.stock_customer) as stock_all_gudang , p.discount, pr.rating, pr.id as review_id, p.is_flash_sale, group_concat(distinct(ip.url)) as url  ,p.name, c.category_name, c.id as category_id ,min(vp.price) as price, b.brands_name, b.id as brand_id from products p
    join variant_product vp on vp.products_id = p.id
    join brands b on b.id = p.brands_id
    join stock s on s.variant_product_id = vp.id
    join category c on c.id = p.category_id
    join image_product ip on ip.products_id = p.id
    left join product_review pr on pr.products_id = p.id
    group by p.id
    having stock_all_gudang > 0 and ${conditions.where};`

    try {
        let filterCategory = await query(getProductCategoryQuery)

        res.send({
            error : false,
            filterCategory
        })
    } catch (error) {
        res.send({
            error: true,
            message : error.message
        })
    }
}
const getProductByMultipleCategory = async(req, res) => {
    // id Category
    let filter = req.body
    
    let conditions = buildConditions(filter)

    let getProductMultipleCategoryQuery = `select p.id, sum(s.stock_customer) as stock_all_gudang , p.discount, pr.rating, pr.id as review_id, p.is_flash_sale, group_concat(distinct(ip.url)) as url  ,p.name, c.category_name, c.id as category_id ,min(vp.price) as price, b.brands_name, b.id as brand_id from products p
    join variant_product vp on vp.products_id = p.id
    join brands b on b.id = p.brands_id
    join stock s on s.variant_product_id = vp.id
    join category c on c.id = p.category_id
    join image_product ip on ip.products_id = p.id
    left join product_review pr on pr.products_id = p.id
    group by p.id
    having stock_all_gudang > 0 and ${conditions.where};`

    try {
        let filterCategory = await query(getProductMultipleCategoryQuery)

        res.send({
            error : false,
            filterCategory
        })
    } catch (error) {
        res.send({
            error: true,
            message : error.message
        })
    }
}


const getProductDetail = async(req, res) => {
    let id = req.params.id

    let productByIdQuery = `select p.id, name, discount, is_flash_sale, brands_name from products p join brands b on b.id = p.brands_id where p.id = ?;`
    let productReviewQuery = `select pr.id, rating, review, full_name from product_review pr
    join users u on u.id = pr.users_id
    join user_detail ud on ud.id = u.user_detail_id
    where products_id = ? order by rating desc;`
    let productImageQuery = `select * from image_product where products_id = ?;`
    let sizeAndStockQuery = `select sum(s.stock_customer) as stock_customer,price, ps.size from variant_product vp 
    join stock s on s.variant_product_id = vp.id
    join product_size ps on ps.id = vp.product_size_id
    where products_id = ?
    group by vp.id;`

    try {
        const productInformation = await query(productByIdQuery, id)
        const productReview = await query(productReviewQuery, id)
        let avgRating = 0
        productReview.forEach((val, i) => {
            avgRating += val.rating
        })
        let avgRat = Math.floor(avgRating / productReview.length)

        const productImage = await query(productImageQuery, id)
        const productSize = await query(sizeAndStockQuery, id)

        res.send({
            error : false,
            productInformation,
            productReview,
            avgRat,
            productImage,
            productSize
        })

    } catch (error) {
        res.send({
            error: true,
            message : error.message
        })
    }



}

module.exports = {
    getAllProduct,
    getFilter,
    getProductByCategory,
    getProductDetail,
    getProductByMultipleCategory

}