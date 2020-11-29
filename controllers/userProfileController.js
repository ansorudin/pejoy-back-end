const Axios = require('axios');
const db = require('./../database/mysql');
const query = require('./../database/mysqlAsync');;
const jwt = require('jsonwebtoken');

module.exports = {
    getDataUsers: (req, res) => {
        const data = req.body

        db.query(`SELECT u.id, ud.full_name, u.email, ud.phone_number, u.created_at, u.user_role  FROM user_detail ud
        JOIN users u ON ud.id = u.user_detail_id WHERE u.id = ?;`, data.id, (err, result) => {
            try {
                if(err) throw err
                
                res.send({
                    error: false,
                    message : 'Get Data User Success',
                    data : result
                })
            } catch (error) {
                res.send({
                    error: true,
                    message : error.message
                })
            }
        })
    },

    addShippingAddress: async (req, res) => {
        const data = req.body
       
        try {
            if(!data.address_detail || !data.city || !data.province || !data.phone_number || !data.receiver_name || !data.users_id || !data.longitude || !data.latitude ) throw { message: 'Data Must Be Filled' }

                if(data.is_main_address === 1){
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
                }else{
                    var sqlQuery4 = 'INSERT INTO shipping_address SET ?'
                    db.query(sqlQuery4, data, (err, resultSqlQuery4) => {
                        try {
                            if(err) throw err
                            
                            var sqlQuery5 = 'SELECT * FROM shipping_address WHERE users_id = ? ORDER BY is_main_address DESC'
                            db.query(sqlQuery5, data.users_id, (err, resultSqlQuery5) => {
                                try {
                                    if(err) throw err

                                    res.send({
                                        error: false, 
                                        message: 'Add Shipping Address Success',
                                        data: resultSqlQuery5
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

    getRajaOngkirProvince: (req, res) => {
        Axios.get('https://api.rajaongkir.com/starter/province?key=598395fbbd5364b73d2c50d57df09682')
        .then((response) => {
            res.send({
                error: false, 
                message: 'Get Raja Ongkir Province Success',
                data: response.data
            })
        })
        .catch((err) => {
            console.log(err)
        })  
    },

    getRajaOngkirCity: (req, res) => {
        Axios.get('https://api.rajaongkir.com/starter/city?key=598395fbbd5364b73d2c50d57df09682')
        .then((response) => {
            res.send({
                error: false, 
                message: 'Get Raja Ongkir City Success',
                data: response.data
            })
        })
        .catch((err) => {
            console.log(err)
        })  
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
        console.log(data.id)
        
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

    updateUsersShippingAddress: async (req, res) => {
        const data = req.body
       
        try {
            if(!data.address_detail || !data.city || !data.province || !data.phone_number || !data.receiver_name || !data.users_id || !data.longitude || !data.latitude ) throw { message: 'Data Must Be Filled' }

                if(data.is_main_address === 1){
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
    
                                    var sqlQuery2 = 'UPDATE shipping_address SET address_detail = ?, city = ?, province = ?, phone_number = ?, receiver_name = ?, users_id = ?, is_main_address = ?, province_id = ?, city_id = ?, nearest_place = ? WHERE id = ?'
                                    db.query(sqlQuery2, [data.address_detail, data.city, data.province, data.phone_number, data.receiver_name, data.users_id, data.is_main_address, data.province_id, data.city_id, data.nearest_place, data.id], (err, resultSqlQuery2) => {
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
                                                            message: 'Edit Shipping Address Success',
                                                            data: resultSqlQuery3
                                                        })
                                                    })
                                                } catch (error) {
                                                    console.log(error)
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
                        var sqlQuery4 = `UPDATE shipping_address SET address_detail = ?, city = ?, province = ?, phone_number = ?, receiver_name = ?, users_id = ?, is_main_address = ?, province_id = ?, city_id = ?, nearest_place = ? WHERE id = ?`
                        db.query(sqlQuery4, [data.address_detail, data.city, data.province, data.phone_number, data.receiver_name, data.users_id, data.is_main_address, data.province_id, data.city_id, data.nearest_place, data.id], (err, resultQuery4) => {
                            try {
                                if(err) throw err

                                var sqlQuery5 = 'SELECT * FROM shipping_address WHERE users_id = ? ORDER BY is_main_address DESC'
                                db.query(sqlQuery5, data.users_id, (err, resultSqlQuery5) => {
                                    try {
                                        if(err) throw err

                                        res.send({
                                            error: false, 
                                            message: 'Edit Shipping Address Success',
                                            data: resultSqlQuery5
                                        })
                                    } catch (error) {
                                        console.log(error)
                                        res.send({
                                            error: true,
                                            message : error.message
                                        })
                                    }
                                })
                            } catch (error) {
                                console.log(error)
                                res.json({
                                    error : true, 
                                    message : error.message
                                })
                            }
                        })
                    }
                }else{
                    var sqlQuery6 = `UPDATE shipping_address SET address_detail = ?, city = ?, province = ?, phone_number = ?, receiver_name = ?, users_id = ?, is_main_address = ?, province_id = ?, city_id = ?, nearest_place = ? WHERE id = ?`
                    db.query(sqlQuery6, [data.address_detail, data.city, data.province, data.phone_number, data.receiver_name, data.users_id, data.is_main_address, data.province_id, data.city_id, data.nearest_place, data.id], (err, resultQuery6) => {
                        try {
                            if(err) throw err

                            var sqlQuery7 = 'SELECT * FROM shipping_address WHERE users_id = ? ORDER BY is_main_address DESC'
                            db.query(sqlQuery7, data.users_id, (err, resultSqlQuery7) => {
                                try {
                                    if(err) throw err

                                    res.send({
                                        error: false, 
                                        message: 'Edit Shipping Address Success',
                                        data: resultSqlQuery7
                                    })
                                } catch (error) {
                                    console.log(error)
                                    res.send({
                                        error: true,
                                        message : error.message
                                    })
                                }
                            })
                        } catch (error) {
                            console.log(error)
                            res.json({
                                error : true, 
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
        JOIN gudang g ON s.gudang_id = g.id ORDER BY p.id ASC;`
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
        ON SCHEDULE AT '${data.eventDate} 11:40:00'
        DO
            UPDATE products SET is_flash_sale = 1, expired_flash_sale = '${data.eventDate} 11:40:00' + INTERVAL 5 MINUTE WHERE id IN (${data.products_id});`
        
        db.query(sqlQuery1, (err, resultQuery1) => {
            try {
                if(err) throw err

                var sqlQuery2 = `CREATE EVENT flash_sale_event_ended_${eventName}
                ON SCHEDULE AT '${data.eventDate} 11:40:00' + INTERVAL 5 MINUTE
                DO
                    UPDATE products SET is_flash_sale = 0, expired_flash_sale = null WHERE expired_flash_sale = '${data.eventDate} 11:40:00' + INTERVAL 5 MINUTE;`
                
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

    getUsersTransactions: (req, res) => {
        const data = req.body

        var sqlQuery1 = `SELECT t.id, p.id AS product_id, td.variant_product_id, b.brands_name, td.product_name, td.product_price, td.qty, 
        g.id AS gudang_id, td.image_product AS image_product, td.shipping_address, st.date AS transaction_date,
        sn.name AS status FROM transaction_detail td
        JOIN variant_product vp ON td.variant_product_id = vp.id
        JOIN products p ON vp.products_id = p.id
        JOIN brands b ON p.brands_id = b.id
        JOIN transaction t ON td.transaction_id = t.id
        JOIN status_transaction st ON td.transaction_id = st.transaction_id
        JOIN status_name sn ON st.status_name_id = sn.id
        JOIN gudang g ON td.gudang_id = g.id
        WHERE st.status_name_id = 2`
        db.query(sqlQuery1, data.status_name_id, (err, resultQuery1) => {
            try {
                if(err) throw err

                let mapResultQuery1 = []

                resultQuery1.forEach((value1, index1) => {
                    let idTransactionExist =  null

                    mapResultQuery1.forEach((find, findIndex) => {
                        if(find.id === value1.id){
                            idTransactionExist = findIndex
                        }
                    })

                    if(idTransactionExist !== null){
                        mapResultQuery1[idTransactionExist].total += value1.qty * value1.product_price
                        mapResultQuery1[idTransactionExist].detail_transaction.push({
                            product_id: value1.product_id,
                            variant_product_id: value1.variant_product_id,
                            brand_name: value1.brands_name,
                            product_name: value1.product_name,
                            product_price: value1.product_price,
                            qty: value1.qty,
                            total_product: value1.qty * value1.product_price,
                            image_product: value1.image_product,
                            gudang_id: value1.gudang_id
                        })
                        mapResultQuery1[idTransactionExist].detail_transaction_to_update.push({
                            qty: value1.qty,
                            gudang_id: value1.gudang_id,
                            variant_product_id: value1.variant_product_id
                        })
                    }else{
                        mapResultQuery1.push({
                            id: value1.id,
                            shipping_address: value1.shipping_address,
                            transaction_date: value1.transaction_date,
                            status: value1.status,
                            total: value1.qty * value1.product_price,
                            detail_transaction: [
                                {
                                    product_id: value1.product_id,
                                    variant_product_id: value1.variant_product_id,
                                    brand_name: value1.brands_name,
                                    product_name: value1.product_name,
                                    product_price: value1.product_price,
                                    qty: value1.qty,
                                    total_product: value1.qty * value1.product_price,
                                    image_product: value1.image_product,
                                    gudang_id: value1.gudang_id
                                }
                            ],
                            transaction_to_update: [
                                {
                                    transaction_id: value1.id,
                                    status_name_id: 3
                                }
                            ],
                            detail_transaction_to_update: [
                                {
                                    qty: value1.qty,
                                    gudang_id: value1.gudang_id,
                                    variant_product_id: value1.variant_product_id
                                }
                            ]
                        })
                    }
                })

                res.send({
                    error: false,
                    message: 'Get Users Transactions Success',
                    data: mapResultQuery1
                })
            } catch (error) {
                res.send({
                    error: true,
                    message : error.message
                })
            }
        })
    },

    deliverProductsToCustomer: (req, res) => {
        let data1 = req.body[0] // Data To Update Status Transaction
        let data2 = req.body[1] // Data To Update Stock

        console.log(data1[0].transaction_id, data1[0].status_name_id)

        db.beginTransaction((err) => {
            Promise.all(data2.map((value, index) => {
                var promise = new Promise((resolve, reject) => {
                    db.query('UPDATE stock SET stock_gudang = stock_gudang - ? WHERE gudang_id = ? AND variant_product_id = ?', [data2[index].qty, data2[index].gudang_id, data2[index].variant_product_id], (err, result) => {
                        try {
                            if(err) throw err
                        } catch (error) {
                        }
                    })
                })
            })).then((response) => {
                var sqlQuery1 = `INSERT INTO status_transaction SET ?`
                db.query(sqlQuery1, data1, (err, resultSqlQuery1) => {
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
                                message: 'Product Delivered To Customer',
                                data: resultSqlQuery1
                            })
                        })
                    } catch (error) {
                        res.send({
                            error: true,
                            message : error.message
                        })
                    }
                })

            }).catch((error) => {
                res.send({
                    error: true,
                    message: error.message
                })
            })
        })
    }
}

