const jwt = require('jsonwebtoken')
const jwtConfig = require('../config/jwtConfig')

const auth = (req,res,next) => {
    const token = req.header('x-auth-token')
    console.log(token)
    // no token
    if(!token) return res.status(401).json({msg: "Access denied"})

    try{
        const decode = jwt.verify(token,jwtConfig.secrect)

        req.user = decode
        next()
        
    }catch(err){res.status(401).json({msg:"Token invalid"})}
}
module.exports = auth