require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('hbs');



var indexRouter = require('./app_server/routes/index');
var usersRouter = require('./app_server/routes/users');
var travelRouter = require('./app_server/routes/travel');
var apiRouter = require('./app_api/routes/index');
var { apiNotFound, apiErrorHandler } = require('./app_api/utils/errors');

// Bring in the database
require('./app_api/models/db');
var passport = require('passport');
require('./app_api/config/passport');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'app_server', 'views', 'partials'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

// Enable CORS
app.use('/api', (req, res, next) => {
const allowedOrigin =
  process.env.CLIENT_ORIGIN || 'http://localhost:4200';

  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});


//wire-up routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/travel', travelRouter);
app.use('/api', apiRouter);

//error handling for API routes


// 1. API: unmatched /api routes -> JSON 404
app.use('/api', apiNotFound);

// 2. API: all errors from /api (auth, validation, DB, malformed JSON, 500s...)
//    -> consistent JSON shape { status, code, message, details? }
app.use('/api', apiErrorHandler);

// 3. Web: catch 404 and forward to the error page handler
app.use(function (req, res, next) {
  next(createError(404));
});

// 4. Web: error page handler
app.use(function (err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;

  if (status >= 500) {
    console.error(`[WEB ERROR] ${req.method} ${req.originalUrl}`, err);
  }

  // set locals, only providing error in development
  res.locals.message = status >= 500 && req.app.get('env') !== 'development'
    ? 'Something went wrong'
    : err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(status);
  res.render('error');
});

module.exports = app;
