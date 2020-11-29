const categoryFilter = require('../helpers/filterCategory')
const buildConditions = require('../helpers/multipleFilter')
const { all } = require('../routers/productRouter')
const query = require('./../database/mysqlAsync')
const db = require('./../database/mysql')
const { default: Axios } = require('axios')

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



const getCart = async(req, res) => {

    let users_id = req.dataToken.id

    let cartQuery = `select sum(s.stock_customer) as stock, c.id, qty, price,(price * qty) as total_price, (price * (discount / 100)) as potongan,((price * (discount / 100)) * qty) as total_potongan , p.name, p.discount, p.is_flash_sale, b.brands_name, size, url from cart c
    join variant_product vp on vp.id = c.variant_product_id
    join products p on p.id = vp.products_id
    join brands b on b.id = p.brands_id
    join product_size ps on ps.id = vp.product_size_id
    join image_product ip on ip.products_id = p.id
    join stock s on s.variant_product_id = vp.id
    where c.users_id = ?
    group by c.id;`

    try {
        const cartData = await query(cartQuery, users_id)
        res.send({
            error : false,
            cartData
        })
        
    } catch (error) {
        res.send({
            error: true,
            message : error.message
        })
    }
}

const getEstimatedOngkir = (req, res) => {
    let data = req.body
    let users_id = req.dataToken.id

    db.query(`select id, longUser, latUser, province_id, city_id from shipping_address
    where users_id = ${users_id} and is_main_address = 1`, (err, result) => {
        try {
            if(err) throw err
            let dataUser = result[0]
            db.query(`SELECT * , (3956 * 2 * ASIN(SQRT( POWER(SIN(( ${dataUser.latUser} - latGudang) *  pi()/180 / 2), 2) +COS( ${dataUser.latUser} * pi()/180) * COS(latGudang * pi()/180) * POWER(SIN(( ${dataUser.longUser} - longGudang) * pi()/180 / 2), 2) ))) as distance  
            from gudang  
            order by distance
            limit 1;`, (err, gudang) => {
                try {
                    if(err) throw err
                    let dataGudang = gudang[0]

                    let query = {
                        key : '65fba3749b9a6449d0dd13fb2aee7f62',
                        origin: dataGudang.city_id, 
                        destination: dataUser.city_id, 
                        weight: data.weight, 
                        courier: data.courier
                    }
                
                    Axios.post('https://api.rajaongkir.com/starter/cost', query)
                    .then((respone) => {
                        res.send({
                            error : false,
                            dataOngkir : respone.data.rajaongkir.results,
                            dataGudang : dataGudang,
                            dataUser : dataUser
                        })
                    })
                    .catch((err) => {
                        console.log(err)
                    })

                } catch (error) {
                    res.send({
                        error: true,
                        message : error.message
                    })
                }
            })
        } catch (error) {
            res.send({
                error: true,
                message : error.message
            })
        }
    })
    
}

const addCart = async(req, res) => {
    let data = req.body
    let users_id = req.dataToken.id

    let queryCheckUserId = `select * from users where id = ?`
    let queryInsertToDb = `insert into cart set ?`
    let queryGetDataCart = `select * from cart where users_id = ? and variant_product_id = ?;`
    let queryGetStockVariantProduct = `SELECT sum(stock_customer) as stock FROM stock where variant_product_id = ?;`

    try {
        if(!data.qty && !data.variant_product_id) throw new Error('Data not complete')
        await query('START TRANSACTION')
        const dataUser = await query(queryCheckUserId, users_id)
        .catch(error => {
            throw error
        })

        if(dataUser.length === 0) throw new Error('User not found')

        const dataStock = await query(queryGetStockVariantProduct, data.variant_product_id )
        .catch(error => {
            throw error
        })

        const dataCartByUser = await query(queryGetDataCart,[dataUser[0].id, data.variant_product_id] )
        .catch(error => {
            throw error
        })

        let stockByVariant = 0
        dataCartByUser.forEach((val, i) => {
            stockByVariant += val.qty
            if(val.id === data.id){
                qtySaatIni += val.qty
            }
        })

        if(data.qty > (dataStock[0].stock - stockByVariant)) throw new Error('qty melebihi stock')

        let dataToInsert = {
            users_id : dataUser[0].id,
            variant_product_id : data.variant_product_id,
            qty : data.qty
        }
        
        const result = await query(queryInsertToDb, dataToInsert)
        .catch(error => {
            throw error
        })

        await query("COMMIT");

        res.send({
            error : false,
            message : 'Add to Cart Succes'
        })

    } catch (error) {
        await query("ROLLBACK");
        console.log('ROLLBACK gagal insert');
        res.send({
            error: true,
            message : error.message
        })
    }
}
const deleteCart = (req, res) => {
    let data = req.body
    let users_id = req.dataToken.id

    try {
        if(!data.id) throw new Error('Data not complete')
        db.query('select * from cart where id = ?', data.id, (err, result) => {
            try {
                if(err) throw err
                db.query('delete from cart where id = ? and users_id = ?', [result[0].id, users_id], (err, result) => {
                    try {
                        if(err) throw err
                        res.send({
                            error : false,
                            message : 'Delete succes'
                        })
                    } catch (error) {
                        res.send({
                            error: true,
                            message : error.message
                        })
                    }
                })
            } catch (error) {
                res.send({
                    error: true,
                    message : error.message
                })
            }
        })
    } catch (error) {
        res.send({
            error: true,
            message : error.message
        })
    }
}

const updateQty = async(req, res) => {
    let data = req.body
    let users_id = req.dataToken.id

    let queryGetDataCart = `select * from cart where users_id = ? and variant_product_id = ?;`
    let queryGetStockVariantProduct = `SELECT sum(stock_customer) as stock FROM stock where variant_product_id = ?;`
    let queryUpdateStock = `update cart set qty = ? where id = ?`

    try {
        if(!data.id && !data.qty && !data.variant_product_id) throw new Error('Data not complete')
        await query('START TRANSACTION')
        const dataStock = await query(queryGetStockVariantProduct, data.variant_product_id )
        .catch(error => {
            throw error
        })

        const dataCartByUser = await query(queryGetDataCart,[users_id, data.variant_product_id] )
        .catch(error => {
            throw error
        })

        let stockByVariant = 0
        let qtySaatIni = 0
        dataCartByUser.forEach((val, i) => {
            stockByVariant += val.qty
            if(val.id === data.id){
                qtySaatIni += val.qty
            }
        })

        if(data.qty > (dataStock[0].stock - (stockByVariant - qtySaatIni))) throw new Error('qty melebihi stock')

        const resultUpdate = await query(queryUpdateStock,[data.qty, data.id])
        .catch(error => {
            throw error
        })
        await query("COMMIT");

        res.send({
            error : false,
            message : 'Update qty Succes'
        })

        
    } catch (error) {
        await query("ROLLBACK");
        console.log('ROLLBACK gagal update');
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
    getProductByMultipleCategory,
    getCart,
    getEstimatedOngkir,
    addCart,
    deleteCart,
    updateQty

}



    