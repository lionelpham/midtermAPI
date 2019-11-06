var passport =require('passport')
var jwtSecret =require('../config/jwtConfig')
var jwt =require('jsonwebtoken')
var db =require('../models')

var express = require('express')

var router = express.Router();
var loginUser = (req,res,next) =>{
    passport.authenticate('login',(err,user,info)=>{
        if(err) res.status(400).json({msg:"Login fail"});
        else if(info != undefined) {
            console.log(info.message)
            return res.status(400).json({msg:info.message})
        } else {
            req.logIn(user,err=>{
                db.User.getUserByUsername(user.username)
                    .then(user=>{
                        const token = jwt.sign({id: user.username},jwtSecret.secrect)
                        res.status(200).send({
                            auth:true,
                            token:token,
                            currentuser:{fullname:user.fullname,username:user.username,email:user.email,imgAvatar:user.imgAvatar,imgAvatarID:user.imgAvatarID},
                            message:'user found & logged in'
                        })
                    })
                    .catch(err => res.status(400).json({msg: "Login fail"}))

            })
        }

    })(req,res,next)
}

router.post('/',loginUser)
module.exports = router