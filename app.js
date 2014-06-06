require( './db' );

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var partials = require('express-partials');
var formidable = require('formidable');
var routes = require('./routes/index');
var user = require('./routes/user');
var topic = require('./routes/topic');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.use(partials());

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser({ uploadDir: './uploads'}));

//session
var MongoStore = require('connect-mongo')(session);
app.use(session({
    secret:'secret',
    store: new MongoStore({
        db : 'session',
    }),
    name:'sid'
}));

app.use(function(req, res, next){
  res.locals.user = req.session.user;
  console.info(req);
  //console.info(res);
  next();
});


app.locals = {
    gtitle:'sns'
};

app.use('/', routes);
app.use('/user', user);
app.use('/topic', topic);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
