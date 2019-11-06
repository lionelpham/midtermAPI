var db = require('../models')
var passport = require('passport')
var express = require('express')

var router = express.Router();

var getUserProfile = (req,res,next) => {
    passport.authenticate('jwt', {session: false}, (err,user,info)=>{ 
        if(err) res.status(401).json({msg: "No Authorized"})
        if (info != undefined){
            console.log(info.message)
            return res.status(401).json({msg: "No Authorized"})
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