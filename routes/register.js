var db = require('../models')
var passport = require('passport')
var express = require('express')

var router = express.Router();

var registerUserRoute = (req,res,next) =>{ 
    passport.authenticate('register',(err,user,info)=>{
        if(err) return res.status(400).json({msg:"User already exist"})
        if(info != undefined){
            console.log(info.message)
            return res.status(400).json({msg:"User already exist"})
        } else {
            req.logIn(user,err => {
                
                const data = {
                    fullname : req.body.fullname,
                    email : req.body.email,
                    imgAvatar : req.body.imgAvatar ? req.body.imgAvatar : null,
                    username : user.username
                }
                console.log(data);
                db.User.getUserByUsername(data.username)
                    .then(user => {
                        
                        user.update({fullname:data.fullname,email:data.email,imgAvatar:data.imgAvatar})
                    //    .updateInforAfterCheck({fullname:data.fullname,email:data.email,imgAvatar:data.imgAvatar})
                            .then(()=>{
                                console.log("user created in db")
                                res.status(200).send({msg:'user created'})
                            })
                    })
            })
        }

    })(req,res,next)
}

router.post('/',registerUserRoute);
module.exports = router;

