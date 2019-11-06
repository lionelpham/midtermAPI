var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Cors = require('cors');
var auth = require('./middleware/auth')


// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var registerRouter = require('./routes/register');
var Profile = require('./routes/profile');
var resetPassword = require('./routes/resetpassword')
var updateProfile = require('./routes/updateYourProfile')
var uploadAvatar = require('./routes/uploadAvatar')
var googleLogin = require('./routes/googleauth')
var passport = require('passport');

var app = express();

require('./passport/passport');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(Cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());



// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/login',loginRouter);
app.use('/register',registerRouter);
//private Route - check header: x-auth-token : this is token of jwt generator after login.
app.use('/auth/profile',auth,Profile);
app.use('/auth/reset-password',auth,resetPassword);
app.use('/auth/update-profile',auth,updateProfile);
app.use ('/auth/upload-avatar',uploadAvatar);
app.use('/login/google',googleLogin);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "localhost:8080"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
