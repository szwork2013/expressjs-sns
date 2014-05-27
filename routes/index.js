require( '../db' );

var express = require('express');
var router = express.Router();

//data
var mongoose = require( 'mongoose' );
var User = mongoose.model('User');


var formidable = require('formidable');

router.get('/', function(req, res) {
    res.render('index', { 
        title: 'no1'
    });
});

router.get('/register', function(req, res) {
    res.render('register', { title: '注册' });
});

router.post('/register', function(req, res) {
        /*
        new formidable.IncomingForm().parse(req, function(err, fields, files) {
             console.info(files);
             console.info(fields);
        });
        */
       new User({
           email:req.body.uemail,
           name:req.body.uname,
           pwd:req.body.upwd
       }).save( function( err, todo, count ){
       if(err){
            res.redirect('/error');
            }else{
            res.redirect('/');
            }
        });
});

router.get('/login', function(req, res) {
    res.render('login', { title: '登陆' });
});

router.post('/login', function(req, res) {
    var username = req.body.username;
    var userpwd = req.body.userpwd;
    User.findOne({name:username},function(err,user){
        if(!user){
            res.redirect('/error'); 
        }
        if(user){
            //登陆成功
            req.session.user = user;
            req.session.save();
            res.redirect('/');
        }
    });
});

router.get('/logout', function(req, res) {
    req.session.destroy(function(err){
        res.locals.user = null;
        if(err){
            res.redirect('/error');
        }else{
            //清除session,退出
            res.redirect('/');
        }
    });
});


router.get('/about', function(req, res) {
    res.render('about', { title: '关于' });
});

router.get('/settings', function(req, res) {
    res.render('settings', { title: '账户设置' });
});

/*
router.use(function(req, res) {
    console.info(123);
});
*/

module.exports = router;
