const client = require('twilio')(process.env.ACCOUNT_ID,process.env.VERIFY_TOKEN)
const query=require('../database/mysqlAsync')
const jwt = require('jsonwebtoken')


let phonenumber
module.exports={
        call_user:async(req,res)=>{
           try {
               const isphone_exist = await query('select phone_number from user_detail where phone_number=?',req.verificationdata.phonenumber)
               if(isphone_exist.length>0){
                        res.status(400).send({
                            success:false,
                            message:'nomor yang ada masukan telah terpakai oleh orang lain'
                        })

               }else{
                try {
                    const user = await query('select attempt,code_attempt from users where id =?',req.verificationdata.id)
                    const attempt=user[0].attempt
                    const code_attempt=user[0].code_attempt
     
                    if(attempt===3||code_attempt===4){
                        //create auto update after one day set 0
                        res.status(400).send({
                            success:false,
                            message:'kamu telah mencapai batas melakukan verifikasi pada hari ini ,coba lagi besok'
                        })
    
                        try {
                            await query(`CREATE EVENT auto_update_transaction_${req.verificationdata.id}
                            ON SCHEDULE AT DATE_ADD(NOW(),INTERVAL 1 MINUTE)
                            DO
                                UPDATE users set attempt = 0 where id = ${req.verificationdata.id}`)
                        } catch (error) {
                            res.status(400).send({
                                success:false,
                                message:'something went wrong try again,later'
                            })
                        }
                    }else{
                         //if< 3 increase the attempt 
    
                            const count = await query(' select attempt + 1 as count from users where id = ?',req.verificationdata.id)
                      
                            const attempt_count = count[0].count
                  
                            await query('update users set? where id=?',[{attempt:attempt_count},req.verificationdata.id])
                     
                  
                    phonenumber=`+${req.verificationdata.phonenumber}`
              
                    const verification= await client.verify.services(process.env.SERVICE_ID)
                    .verifications
                    .create({to:phonenumber.toString(),channel:'sms'})
                     if(verification.status==="pending"){
                        console.log(phonenumber)
                    res.status(200).send({
                        success:true,
                        message:`code telah berhasil dikirim ke no xxxxxxxxxxxx${phonenumber.slice(10,phonenumber.length)}`
                    })
                     }else{
                    res.status(400).send({
                        success:false,
                        message:'kami mengalami gangguan di server kami coba lagi'
                    })
                }
            }
            
        } catch (error) {
         res.status(400).send({
         success:false,
         message:error.message
        })
     }
        
                
               }
           } catch (error) {
               console.log(error)
           }
                         
        },

                     
            
            
                
           
       




        verified_code:async(req,res,next)=>{
            const {id,code}=req.body
            try {
                const code_count= await query('select code_attempt from users where id =?',id)
                const count =code_count[0].code_attempt
                if(count>4){
                    res.status(400).send({
                        success:false,
                        message:'kode telah kadaluarsa,coba lagi besok'
                    })
                    try {
                        await query(`CREATE EVENT auto_update_code_attempt_${id}
                        ON SCHEDULE AT DATE_ADD(NOW(),INTERVAL 1 MINUTE)
                        DO
                            UPDATE users set code_attempt = 0 where id = ${id}`)
                    } catch (error) {
                        res.status(400).send({
                            success:false,
                            message:'something went wrong try again,later'
                        })
                    }
                }else{
                    try {
                        const count = await query(' select code_attempt + 1 as count from users where id = ?',id)
                      
                        const attempt_count = count[0].count
              
                        await query('update users set? where id=?',[{code_attempt:attempt_count},id])


                        const verified= await client.verify.services(process.env.SERVICE_ID)
                                              .verificationChecks
                                              .create({to:phonenumber.toString(),code:code.toString()})
                        
                              
                                if(verified.valid===false){
                                    res.status(400).send({
                                        success:false,
                                        message:'kode yang anda masukan salah'
                                    })
                                }else{

                                    console.log(verified)
                                    req.verified_user={id,phonenumber}
                                    next()
                                }
                              
                  
                          
                    
                  
                                 
                            
                      } catch (error) {
                          console.log(error)
                          res.status(400).send({
                              success:false,
                              message:'kode yang anda masukan salah'
                          
                          })
                      }
                }
            } catch (error) {
                console.log(error)
            }
       
                
        }    
}