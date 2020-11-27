const db = require('./../database/mysql');
const query = require('./../database/mysqlAsync')
const jwt = require('jsonwebtoken');

module.exports = {
    addShippingAddress: async (req, res) => {
        
        const data = req.body
       
        try {
            if(!data.address_detail || !data.city || !data.province || !data.phone_number || !data.receiver_name || !data.users_id || !data.long || !data.lat ) throw { message: 'Data Must Be Filled' }
                
                let findMainAddressQuery = 'SELECT * FROM shipping_address WHERE is_main_address = 1'
                const findMainAddress = await query(findMainAddressQuery)

                if(findMainAddress.length === 1){
                    db.beginTransaction((err) => {
                        if(err) throw err 

                        var sqlQuery1 = 'UPDATE shipping_address SET is_main_address = 0 WHERE id = ?'
                        db.query(sqlQuery1, findMainAddress[0].id, (err, resultSqlQuery1) => {
                            try {
                                if(err){ 
                                    return db.rollback(() => {
                                        throw err
                                    })
                                }

                                var sqlQuery2 = 'INSERT INTO shipping_address SET ?'
                                db.query(sqlQuery2, data, (err, resultSqlQuery2) => {
                                    try {
                                        if(err){ 
                                            return db.rollback(() => {
                                                throw err
                                            })
                                        }
                                        
                                        var sqlQuery3 = 'SELECT * FROM shipping_address WHERE users_id = ? ORDER BY is_main_address DESC'
                                        db.query(sqlQuery3, data.users_id, (err, resultSqlQuery3) => {
                                            try {
                                                if(err){ 
                                                    return db.rollback(() => {
                                                        throw err
                                                    })
                                                }
                                                
                                                db.commit((err) => {
                                                    if(err){ 
                                                        return db.rollback(() => {
                                                            throw err
                                                        })
                                                    }
                                                    
                                                    res.send({
                                                        error: false, 
                                                        message: 'Add Shipping Address Success',
                                                        data: resultSqlQuery3
                                                    })
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
                        })
                    })  
                }else{
                    var sqlQuery2 = 'INSERT INTO shipping_address SET ?'
                    db.query(sqlQuery2, data, (err, resultSqlQuery2) => {
                        try {
                            if(err) throw err
                            
                            var sqlQuery3 = 'SELECT * FROM shipping_address WHERE users_id = ? ORDER BY is_main_address DESC'
                            db.query(sqlQuery3, data.users_id, (err, resultSqlQuery3) => {
                                try {
                                    if(err) throw err

                                    res.send({
                                        error: false, 
                                        message: 'Add Shipping Address Success',
                                        data: resultSqlQuery3
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
        } catch (error) {
            res.send({
                error: true,
                message : error.message
            })
        }
    },

    getUserShippingAddress: (req, res) => {
        const data = req.body

        var sqlQuery = 'SELECT * FROM shipping_address WHERE users_id = ? ORDER BY is_main_address DESC'
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

    getUsersShippingAddressToEdit: (req, res) => {
        const data = req.body
        
        var sqlQuery = 'SELECT * FROM shipping_address WHERE id = ?'
        db.query(sqlQuery, data.id, (err, result) => {
            try {
                if(err) throw err
                
                res.send({
                    error: false,
                    message: 'Get Users Shipping Address To Edit Success',
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

    deleteUsersShippingAddress: (req, res) => {
        const address_id = Number(req.params.idAddress)
        const users_id = Number(req.params.idUsers)

        var sqlQuery = 'DELETE FROM shipping_address WHERE id = ? AND users_id = ?;'
        db.query(sqlQuery, [address_id, users_id], (err, result) => {
            try {
                if (err) throw err

                var sqlQuery1 = 'SELECT * FROM shipping_address WHERE users_id = ? ORDER BY is_main_address DESC'
                db.query(sqlQuery1, users_id, (err, resultQuery1) => {
                    try {
                        if(err) throw err
                        
                        res.json({
                            error : false, 
                            message : 'Delete Shipping Address Success',
                            data: resultQuery1
                        })
                    } catch (error) {
                        res.send({
                            error: true,
                            message : error.message
                        })
                    }
                })
            } catch (error) {
                res.json({
                    error : true,
                    message : error.message,
                    detail : error
                })
            }
        })
    },

    getWarehouseInventory: (req, res) => {
        const data = req.body

        var sqlQuery = `SELECT p.id AS product_id, vp.id AS variant_product_id, p.name, ps.size, vp.price, s.stock_customer, s.stock_gudang, g.gudang_name FROM variant_product vp
        JOIN products p ON vp.products_id = p.id
        JOIN product_size ps ON vp.product_size_id = ps.id
        JOIN stock s ON vp.id = s.variant_product_id
        JOIN gudang g ON s.gudang_id = g.id;`
        db.query(sqlQuery, (err, result) => {
            try {
                if(err) throw err
                
                res.send({
                    error: false,
                    message: 'Get Warehouse Inventory Success',
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

    getDiscountProducts: (req, res) => {
        var sqlQuery = 'SELECT * FROM products WHERE discount > 0'
        db.query(sqlQuery, (err, result) => {
            try {
                if(err) throw err

                res.send({
                    error: false,
                    message: 'Get Discount Products Success',
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

    
    createFlashSaleEvent: (req, res) => {
        const data = req.body
        const eventName = String(data.eventDate).split(' ')[0].replace(/-/g, '_')

        var sqlQuery1 = `CREATE EVENT flash_sale_event_${eventName}
        ON SCHEDULE AT '${data.eventDate} 02:15:00'
        DO
            UPDATE products SET is_flash_sale = 1, expired_flash_sale = '${data.eventDate} 02:15:00' + INTERVAL 1 DAY WHERE id IN (${data.products_id});`
        
        db.query(sqlQuery1, (err, resultQuery1) => {
            try {
                if(err) throw err

                var sqlQuery2 = `CREATE EVENT flash_sale_event_ended_${eventName}
                ON SCHEDULE AT '${data.eventDate} 02:15:00' + INTERVAL 1 DAY
                DO
                    UPDATE products SET is_flash_sale = 0, expired_flash_sale = null WHERE expired_flash_sale = '${data.eventDate} 02:15:00' + INTERVAL 1 DAY;`
                
                db.query(sqlQuery2, (err, resultQuery2) => {
                    try {
                        if(err) throw err

                        var sqlQuery3 = 'SELECT * FROM products WHERE discount > 0'
                        db.query(sqlQuery3, (err, resultQuery3) => {
                            try {
                                if(err) throw err

                                res.send({
                                    error: false,
                                    message: 'Create Flash Sale Event Success',
                                    data: resultQuery3
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
        })
    },
}
