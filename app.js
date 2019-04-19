//This package allows program to read hidden .env variables
require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const bodyParser = require('body-parser');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin','*');
//   res.header('Access-Control-Allow-Headers','*');
//   if (req.method === 'OPTIONS'){
//     res.header('Access-Control-Allow-Methods', 'PUT,GET,POST,PATCH,DELETE');
//     return res.status(200).json({});
//   }
// });

app.use('/', indexRouter);
app.use('/users', usersRouter);


// // Flash messages as middleware
// app.use(flash());

// // Setting up our middleware to work
// app.use( (request, response, next) =>{
//   response.locals.user = request.user;
//   // request.path is the url 
//   // allows us to access url local anywhere in project
//   response.locals.url = request.path;
//   // makes flash available everywhere
//   response.locals.flash = request.flash();
//   next();
// });

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
