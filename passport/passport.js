var jwtSecret = require('../config/jwtConfig')
var bcrypt = require('bcrypt')
var Sequelize = require('sequelize')
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const BCRYPT_SALT_ROUNDS = 12;

const passport = require('passport'),
    localStrategy = require('passport-local').Strategy,
    db = require('../models'),
    JWTstrategy = require('passport-jwt').Strategy,
    ExtractJWT = require('passport-jwt').ExtractJwt;

const GOOGLE_AUTH = require('../config/ggfbConfig').google

passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (obj, done) {
    done(null, obj);
});


passport.use(new GoogleStrategy({
    clientID: GOOGLE_AUTH.client_id,
    clientSecret: GOOGLE_AUTH.client_secret,
    callbackURL: GOOGLE_AUTH.callback_url
    },
    function(accessToken, refreshToken, profile, cb) {
        //save user to db 
        db.User.findOne({ googleID: profile.id })
            .then(user => {
                if(user)
                    cb(null,user)
                else{
                    const newUser = {
                        googleID: profile.id,
                        fullname: profile.name.familyName + ' ' + profile.name.givenName,
                        email: profile.emails[0].value,
                        imgAvatar: profile.picture
                    }
                    db.User.createGoogleUser(newUser)
                        .then(user => cb(null,user))
                }
            })
            .catch(err=>cb(err))
        
    }
));


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
                            bcrypt.hash(password,BCRYPT_SALT_ROUNDS)
                            .then(hashedPassword => {
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
    'reset-password',
    new JWTstrategy(opts,(jwt_payload,done)=>{
        try{
            console.log('payload',jwt_payload);
            const username_payload= jwt_payload.id;
            db.User.getUserByUsername(username_payload)
                .then(user => {
                    if(user){
                        console.log('demo user reset',user)
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

passport.use(
    'updateprofile',
    new JWTstrategy(opts,(jwt_payload,done)=>{
        try{
            console.log('payload',jwt_payload);
            const username_payload= jwt_payload.id;
            db.User.getUserByUsername(username_payload)
                .then(user => {
                    if(user){
                        console.log('demo user update',user)
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
passport.use(
    'uploadAvatar',
    new JWTstrategy(opts,(jwt_payload,done)=>{
        try{
            console.log('payload',jwt_payload);
            const username_payload= jwt_payload.id;
            db.User.getUserByUsername(username_payload)
                .then(user => {
                    if(user){
                        console.log('demo user reset',user)
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
passport.use(
    'jwt',
    new JWTstrategy(opts,(jwt_payload,done)=>{
        try{
            console.log('payload',jwt_payload);
            const username_payload= jwt_payload.id;
            db.User.getUserByUsername(username_payload)
                .then(user => {
                    if(user){
                        console.log('demo user',user)
                        console.log("user found in db in passport")
                        return done(null,user)
                    }
                    else{
                        console.log('user not found')
                        return done(null,false);
                    }
                })
                
        }catch(err){
            console.log('err',err)
            done(err);
        }
    })

)
