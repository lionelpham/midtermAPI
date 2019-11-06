var db = require('../models')
var passport = require('passport')
var express = require('express')
var bcrypt = require('bcrypt')
var router = express.Router();

var resetPassword = (req,res,next) => {
    passport.authenticate('reset-password', {session: false},
     (err,user,info)=>{
        console.log('jwt',user)
        if(err) console.log(err)
        if (info != undefined){
            console.log(info.message)
            res.send(info.message)
        } else {
            const data = {
                username : user.username,
                newpassword: req.body.newpassword
            }
            console.log("in-reset",data)
            try{
                
                bcrypt.hash(data.newpassword,12)
                    .then(hashPassword => {
                        user.update({password:hashPassword})
                            .then(()=>{
                                res.status(200).send(
                                    {
                                        message:'changed password success',
                                        auth:false
                                    })
                                
                            })
                    })
            } catch(err) {
                console.log('reset',err)
            }
            
            
        }

    })(req,res,next)
}

router.post('/',resetPassword)
module.exports = router