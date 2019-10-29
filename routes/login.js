var passport =require('passport')
var jwtSecret =require('../config/jwtConfig')
var jwt =require('jsonwebtoken')
var db =require('../models')

var express = require('express')

var router = express.Router();
var loginUser = (req,res,next) =>{
    passport.authenticate('login',(err,user,info)=>{
        if(err) console.log(err)
        if(info != undefined) {
            console.log(info.message)
            res.send(info.message)
        } else {
            req.logIn(user,err=>{
                db.User.getUserByUsername(user.username)
                    .then(user=>{
                        const token = jwt.sign({id: user.username},jwtSecret.secrect)
                        res.status(200).send({
                            auth:true,
                            token:token,
                            message:'user found & logged in'
                        })
                    })
            })
        }

    })(req,res,next)
}

router.post('/',loginUser)
module.exports = router