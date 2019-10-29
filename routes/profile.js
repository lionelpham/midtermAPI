var db = require('../models')
var passport = require('passport')
var express = require('express')

var router = express.Router();

var getUserProfile = (req,res,next) => {
    passport.authenticate('jwt', {session: false}, (err,user,info)=>{
        console.log('jwt',user)
        if(err) console.log(err)
        if (info != undefined){
            console.log(info.message)
            res.send(info.message)
        } else {
            console.log('user found')
            res.status(200).send({
                auth:true,
                user
            })
        }

    })(req,res,next)
}

router.get('/',getUserProfile);
module.exports = router;