require( './db' );

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var session = require('express-session');
var partials = require('express-partials');
var formidable = require('formidable');


var user = require('./routes/user');
var board = require('./routes/board');
var topic = require('./routes/topic');
var message = require('./routes/message');
var tips = require('./routes/tips');
var collect = require('./routes/collect');
var about = require('./routes/about');
var relation = require('./routes/relation');
var car = require('./routes/car');
var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.use(partials());
app.use(compress());
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'),{maxAge:86400000}));
app.use(bodyParser({ uploadDir: './assets'}));

//session
var MongoStore = require('connect-mongo')(session);
app.use(session({
    secret:'secret',
    store: new MongoStore({
        db : 'session',
    }),
    cookie: { maxAge: 86400000 },
    name:'sid'
}));

app.use(function(req, res, next){
  res.locals.user = req.session.user;
  if(req.session.user && req.session.user.baned){
        req.session.destroy(function(err){
            res.locals.user = null;
            res.redirect('/baned');
        });
  }
  next();
});

//global config
app.locals = {
    gtitle:'风车',
    gurl:'www.xxx.com',
    isdev:true,
    jsfolder:'/js',
};

app.use('/user', user);
app.use('/b', board);
app.use('/topic', topic);
app.use('/message', message);
app.use('/tips', tips);
app.use('/collect', collect);
app.use('/about', about);
app.use('/relation', relation);
app.use('/car', car);
app.use('/', routes);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('抱歉,未找到页面,到别处转转!');
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
