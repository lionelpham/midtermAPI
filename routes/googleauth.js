var passport =require('passport')
var jwtSecret =require('../config/jwtConfig')
var jwt =require('jsonwebtoken')
var db =require('../models')

var express = require('express')

var router = express.Router();


router.get('/',passport.authenticate('google',{scope : ['profile']}))
router.get('/callback',passport.authenticate('google',{failureRedirect:'http://localhost:3000/login'},
    (req,res) => {
        res.status(200).send({
            msg:"ok"
        })
    }
))
module.exports = router