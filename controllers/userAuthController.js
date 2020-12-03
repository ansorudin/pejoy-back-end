const bycrpt = require('bcryptjs')
const query = require('../database/mysqlAsync')
const {validationResult} =require('express-validator')
const jwt = require('jsonwebtoken')
const setRole = require('../helpers/set_role')
require('dotenv').config()
const fs=require('fs')
const handlebar=require('handlebars')
const nodemailer=require('../helpers/nodemailer')


module.exports={
        socialRegister: async(req,res)=>{
                try {
                const {email,avatar}=req.socialData

                let user_role = setRole(email)

                const insertDetail = await query('insert into user_detail set?',{user_name:email,avatar})
                const hashed = await bycrpt.hash(process.env.SECRET_KEY+email,10)
                const insertUser=  await query('insert into users set?',{email,password:hashed,user_role,user_detail_id:insertDetail.insertId})
                
                const token=jwt.sign({id:insertUser.insertId},process.env.SECRET_KEY,{expiresIn:'1m'})
                
                res.status(200).send({
                    success:true,
                    message:'register success',
                    token,
                    new_user:{id:insertUser.insertId,email,user_name:email,avatar,user_role,is_verified:0}
                })
                
                } catch (error) {
                    res.status(400).send({
                        success:false,
                        message:'something went wrong, please try again'
                    })
                    
                }
                    
            },
                    
    
          
           

        Register:async(req,res)=>{

            const {username,email,password}=req.body
            const notValid = validationResult(req)

            if(!notValid.isEmpty()){
            const firstError = notValid.array().map(error => error.msg)[0];

             res.status(422).json({
                 success:false,
                message: firstError
                });

            
            }else{
                try {
    
                    const user = await query(`select * from users where email =?`,email)
                    const name= await query(`select * from user_detail where user_name like'${username}'`)
            
            
                    if(user.length>0)throw `${email} already exist`
                    if(name.length>0)throw `${username} already exist`

                    let user_role = setRole(email)
                   
                    const insertDetail = await query('insert into user_detail set?',{user_name:username})
                    const hashed = await bycrpt.hash(password,10)
                    const insertUser=  await query('insert into users set?',{email,password:hashed,user_role,user_detail_id:insertDetail.insertId})
                    
                    const token=jwt.sign({id:insertUser.insertId},process.env.SECRET_KEY,{expiresIn:'1m'})
                    
                    
                    
                    res.status(200).send({
                        success:true,
                        message:'register success',
                        token,
                        new_user:{id:insertUser.insertId,email,user_name:username,avatar:null,user_role,is_verified:0}
                    })
            
                    
                } catch (error) {
                    res.status(422).send({
               
                        success:false,
                        message:error
                    })
                  
                }
            }
        },

        Login:async(req,res)=>{
            const {email,password}=req.body
            const notValid = validationResult(req)
            
            
            if(!notValid.isEmpty()){
                const firstError = notValid.array().map(error => error.msg)[0];
    
                res.status(422).send({
                    success:false,
                    message: firstError
                    });
    
                
                }else{
                    try {
                       
                        const user_email= await query('select email from users where email=?',email)
                        if(user_email.length===0) throw `${email} doesnt exist in our apps please sign up`

                        const hashed= await bycrpt.hash(password,10)
                        const user = await query('select u.id,u.email as user_email,u.user_role,u.is_verified,ud.user_name,ud.avatar from users u join user_detail ud on u.user_detail_id = ud.id where u.password=?',hashed)

                        if(user.length===0) throw `email and password doesnt match`
                        const token = jwt.sign({id:user.id},process.env.SECRET_KEY,{expiresIn:'1d'})

                        res.status(200).send({
                            success:true,
                            token,
                            message:'login success',
                            old_user:user[0]
                        })
                        
                    } catch (error) {
                        res.status(400).send({
                            success:false,
                            message:error
                        })
                    }
                        


                }

        },
        PhoneVerfication:async (req,res)=>{
           
            
            
         
                try {
                    const {id,phonenumber}=req.verified_user
                    const user_phone = await query('select ud.phone_number as user_phone ,u.user_detail_id from users u join user_detail ud on u.user_detail_id = ud.id where u.id=?',id)
                    const {nomorhape,user_detail_id}=user_phone[0]

                    if(nomorhape===phonenumber){
                        try {
                            await query('update user_detail set? where id =?',[{phone_number:phonenumber},user_detail_id])
                            res.status(200).send({
                                success:true,
                                message:'nomor lama anda telah kamu perbarui ,dan telah terverifikasi'
                            })
                        } catch (error) {
                           res.status(400).send({
                               success:false,
                               message:'something went wrond please try again'
                           })
                        }
                    }else{
                        try {
                            await query('update user_detail set? where id =?',[{phone_number:phonenumber},user_detail_id])
                            await query('update users set? where user_detail_id=?',[{is_verified:1},user_detail_id])
                            res.status(200).send({
                                success:true,
                                message:'nomor anda telah kami verifikasi terima kasih'
                            })
                        } catch (error) {
                            res.status(400).send({
                                success:false,
                                message:'something went wrond please try again'
                            })
                        }
                    }
                } catch (error) {
                    res.status(400).send({
                        success:false,
                        message:'something went wrond please try again'
                    })
                   
                }
           
        },

        forgotPassword:async(req,res)=>{
            const {email}= req.body
            const notValid = validationResult(req)
            if(!notValid.isEmpty()){
                const firstError = notValid.array().map(error => error.msg)[0];
    
                res.status(422).send({
                    success:false,
                    message: firstError
                    });
    
                
                }else{

                    try {
                        const user = await query('select id, email from users where email=?',email)
                        const user_email = user[0].email
                        const id=user[0].id
                        if(user_email){
                            //send email/with token expiry 5 menit
                            const token = jwt.sign({id:id},process.env.SECRET_KEY,{expiresIn: '20m'})
                            
                            fs.readFile(
                                "D:/Purwadhika/project-akhir-server/template/email.html",
        
                                { encoding: "utf-8" },
                                (err, file) => {
                                    if (err) throw err;
                                    const template = handlebar.compile(file);
                                    const resulttemplate=template({
                                        email:email,
                                        link:`http://localhost:3000/resetpassword/${token}`
                                    })
                                    nodemailer
                                        .sendMail({
                                            from: "pejoy.com",
                                            to: email,
                                            subject: "password recovery",
                                            html: resulttemplate
                                        })
                                        .then(respons => {
                                            res.status(200).send({
                                                error: false,
                                                message: " please check your mail to recover your account !!"
                                            });
                                        })
                                        .catch(err => {
                                            res.status(500).send({
                                                error: true,
                                                message: 'something went wrong'
                                            });
                                        });
                                }
                            );
                        }else{
                            res.status(400).send({  
                                success:false,
                                message:'email not found ,please sign up'
                            })
                        }
                    } catch (error) {
                     console.log(error)
                    }
                }
   

        },
        resetpassword:async(req,res)=>{
            const {newPassword}= req.body
            console.log(newPassword)
           
            
            const notValid = validationResult(req)
        
            if(!notValid.isEmpty()){
                const firstError = notValid.array().map(error => error.msg)[0];
                    console.log(firstError)
                res.status(400).send({
                    success:false,
                    message: firstError
                    });
    
                
                }else{
                     try {
                         const hashed = await bycrpt.hash(newPassword,10)
                         await query('update users set? where id=?',[{password:hashed},req.dataToken.id])
                         res.status(200).send({
                             success:false,
                             message:'update password success'
                         })
                     } catch (error) {
                         console.log(error)
                     }
                }
        }
            
    }

      

       
            



     


       





