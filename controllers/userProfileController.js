const db = require('./../database/mysql');
const jwt = require('jsonwebtoken');

module.exports = {
    addShippingAddress: (req, res) => {
        
        const data = req.body
       
        try {
            if(!data.address_detail || !data.city || !data.province || !data.phone_number || !data.receiver_name || !data.users_id || !data.long || !data.lat ) throw { message: 'Data Must Be Filled' }
            
            db.beginTransaction((err) => {
                if(err) throw err

                db.query('SELECT * FROM shipping_address WHERE is_main_address = 1', (err, result) => {
                    try {
                        if(err){ 
                            return db.rollback(() => {
                                throw err
                            })
                        }
    
                        if(result.length === 1){
                            var sqlQuery1 = 'UPDATE shipping_address SET is_main_address = 0 WHERE id = ?'
                            db.query(sqlQuery1, result[0].id, (err, resultSqlQuery1) => {
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
                                            
                                            var sqlQuery3 = 'SELECT * FROM shipping_address WHERE users_id = ?'
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
                                                            message: 'Shipping Address Added Successfully',
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
                        }else{
                            var sqlQuery2 = 'INSERT INTO shipping_address SET ?'
                            db.query(sqlQuery2, data, (err, resultSqlQuery2) => {
                                try {
                                    if(err) throw err
                                    
                                    var sqlQuery3 = 'SELECT * FROM shipping_address WHERE users_id = ?'
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
                })   
            })

        } catch (error) {
            res.send({
                error: true,
                message : error.message
            })
        }
    },

    getUserShippingAddress: (req, res) => {
        const data = req.body

        var sqlQuery = 'SELECT * FROM shipping_address WHERE users_id = ?'
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
        ON SCHEDULE AT '${data.eventDate}'
        DO
            UPDATE products SET is_flash_sale = 1, expired_flash_sale = '${data.eventDate}' + INTERVAL 1 DAY WHERE id IN (${data.products_id});`
        
        db.query(sqlQuery1, (err, resultQuery1) => {
            try {
                if(err) throw err

                var sqlQuery2 = `CREATE EVENT flash_sale_event_ended_${eventName}
                ON SCHEDULE AT '${data.eventDate}' + INTERVAL 1 DAY
                DO
                    UPDATE products SET is_flash_sale = 0, expired_flash_sale = null WHERE expired_flash_sale = '${data.eventDate}' + INTERVAL 1 DAY;`
                
                db.query(sqlQuery2, (err, resultQuery2) => {
                    try {
                        if(err) throw err

                        res.send({
                            error: false,
                            message: 'Create Flash Sale Event Success'
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
