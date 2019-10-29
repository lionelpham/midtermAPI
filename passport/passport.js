var jwtSecret = require('../config/jwtConfig')
var bcrypt = require('bcrypt')
var Sequelize = require('sequelize')

const BCRYPT_SALT_ROUNDS = 12;

const passport = require('passport'),
    localStrategy = require('passport-local').Strategy,
    db = require('../models'),
    JWTstrategy = require('passport-jwt').Strategy,
    ExtractJWT = require('passport-jwt').ExtractJwt;
// register user
passport.use('register', 
    new localStrategy({
        usernameField: 'username',
        passwordField: 'password',
        session: false
        },
        (username,password,done) => {
            
            try{
                db.User.getUserByUsername(username)
                    .then(user => {
                        if(user != null){
                            
                            console.log("user already created");
                            done(null,false,{message:'user already created'})
                        }
                        else {
                            bcrypt.hash(password,BCRYPT_SALT_ROUNDS).then(hashedPassword => {
                                db.User.createNewUser({username,password : hashedPassword})
                                    .then(user => {
                                        console.log('user is created')
                                        return done(null,user);
                                    })
                            })
                        }
                    })
            }catch(err){
                done(err);
            }
        }
    )
)

passport.use(
    'login',
    new localStrategy(
        {
            usernameField : 'username',
            passwordField : 'password',
            session:false
        },
        (username,password,done) => {
            console.log(username,password);
            try{
                db.User.getUserByUsername(username)
                    .then(user => {
                        if(user == null){
                            return done(null,false,{message:"bad username"})
                        } else {
                            bcrypt.compare(password,user.password).then(res => {
                                if (res != true){
                                    console.log("failed password");
                                    return done(null,false,{messenger:"failed password"})
                                }
                                console.log('user founded')
                                return done(null,user);
                            })
                        }
                    })
            }catch (err){
                done(err)
            }
        }
    )
)

const opts = {
    jwtFromRequest : ExtractJWT.fromAuthHeaderAsBearerToken('JWT'),
    secretOrKey: jwtSecret.secrect
}

passport.use(
    'jwt',
    new JWTstrategy(opts,(jwt_payload,done)=>{
        try{
            const username_payload= jwt_payload.id;
            db.User.getUserByUsername(username_payload)
                .then(user => {
                    if(user){
                        console.log(user)
                        console.log("user found in db in passport")
                        return done(null,user)
                    }
                    else{
                        console.log('user not found')
                        return done(null,false);
                    }
                })
        }catch(err){
            done(err);
        }
    })

)
