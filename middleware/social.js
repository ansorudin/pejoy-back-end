const jwt = require('jsonwebtoken')
const {OAuth2Client}= require('google-auth-library')
const query=require('../database/mysqlAsync')
const client= new OAuth2Client(process.env.GOOGLE_CLIENT)
const axios = require('axios')
const fs=require('fs')
require('dotenv').config()


module.exports={
    googleMidd: async (req,res,next)=>{
        try {
            const {idToken}=req.body
            const response =  await client.verifyIdToken({idToken,audience:process.env.GOOGLE_CLIENT})
            const { email_verified,email,picture } = response.payload;

            if(email_verified){
                 try {
                 const user= await query(' select u.id,u.email as user_email,u.user_role,u.is_verified,ud.user_name,ud.avatar from users u join user_detail ud on u.user_detail_id = ud.id where u.email=?',email)
               
                     if(user.length>0){
                     const token=jwt.sign({id:user.id},process.env.SECRET_KEY,{expiresIn:'1d'})
                     old_user=user[0]

                     res.status(200).send({
                     token,
                     old_user         
                    })    

                     }else{

                     let avatar= 'pejoy-avatar-picture-' + Date.now() + Math.random() * 1000 + '.jpg'

                        axios({
                         method: 'get',
                         url:picture,
                         responseType: 'stream'
                         })
                         .then( (response)=> {
                       
                            response.data.pipe(fs.createWriteStream(`public/profile-images/${avatar}`))
                            req.socialData= {email,avatar}

                             next()

                         }).catch((error)=>{
                         res.status(400).send({
                         success:false,
                         message: 'Something went wrong . Try again!'
                          });
                        })
                
                     }
                          
        
                     } catch (error) {
                     res.status(400).send({
                     success:false,
                     message: 'Something went wrong . Try again!'
                     });
                 }
            }else{
             res.status(400).send({
             success:false,
             message: 'Something went wrong . Try again!'
            });
        }
                    
        } catch (error) {
          res.status(400).send({
          success:false,
         message:error.message?error.message:error
      })
    }
        
},

facebookMidd: async (req,res,next)=>{
        try {
            const { userID, accessToken } = req.body;

            const response = await axios.get(`https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email,picture&access_token=${accessToken}`)
                
                  
            const {email,picture}=response.data
            const image=picture.data.url
               

            const user = await query('select u.id,u.email as user_email,u.user_role,u.is_verified,ud.user_name,ud.avatar from users u join user_detail ud on u.user_detail_id = ud.id where u.email=?',email)
                if(user.length>0){
                const token=jwt.sign({id:user.id},process.env.SECRET_KEY,{expiresIn:'1d'})
                 old_user=user[0]
                 res.status(200).send({
                 token,
                 old_user         
                 })    

                  }else{
                        
                 let avatar= 'pejoy-avatar-picture-' + Date.now() + Math.random() * 1000 + '.jpg'
                    axios({
                    method: 'get',
                    url:image,
                    responseType: 'stream'
                   })
                   .then( (response)=> {
                       
                    response.data.pipe(fs.createWriteStream(`public/profile-images/${avatar}`))
                    req.socialData= {email,avatar}
    
                    next()
    
                    })
                    .catch((error)=>{
                     res.status(400).send({
                     success:false,
                     message: 'Something went wrong . Try again!'
                    });
                  })
                
                }
                
            } catch (error) {
              res.status(400).json({
              success:false,
              message:'something went wrong,please try again'
                    });
                }
             }
    }
        
                           
                     
                     
                  
