var passport = require('passport')
var express = require('express')
var router = express.Router();

var UpdateProfile = (req,res,next) => {
    passport.authenticate('updateprofile', {session: false},
     (err,user,info)=>{
        console.log('jwt',user)
        if(err) console.log(err)
        if (info != undefined){
            console.log(info.message)
            res.send(info.message)
        } else {
            const data = {
                fullname: req.body.fullname,
                email: req.body.email,
            }
            try {
                user.update({fullname:data.fullname,email:data.email})
                    .then(user => {
                        res.status(200).send({
                            message:"update success",
                            user
                        })
                    })
                    .catch(err => console.log(err))
            }
            catch(err){
                console.log(err)
            }
            
        }

    })(req,res,next)
}

router.post('/',UpdateProfile)
module.exports = router