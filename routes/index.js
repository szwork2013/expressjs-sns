require( '../db' );

var express = require('express');
var router = express.Router();

var mongoose = require( 'mongoose' );
var User = mongoose.model('User');
var formidable = require('formidable');

router.get('/', function(req, res) {
    res.render('index', { 
        title: 'rabbit'
    });

});

router.get('/register', function(req, res) {
    res.render('register', { title: '注册' });
});

router.post('/register', function(req, res) {

         /*
     new formidable.IncomingForm().parse(req, function(err, fields, files) {
         //console.info(files);
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

router.post('/userv', function(req, res) {
    var message = '';

});

router.get('/login', function(req, res) {
    res.render('login', { title: '登陆' });
});

router.post('/login', function(req, res) {
    var username = req.body.username;
    var userpwd = req.body.userpwd;
    User.findOne({name:username},function(err,user){
        if(err){
            next(err); 
        }
        if(!user){
            res.redirect('/error'); 
        }
        if(user){
            //登陆成功
            req.session.user = user;
            res.redirect('/');
        }
    });
});

router.get('/about', function(req, res) {
    res.render('about', { title: '关于' });
});

module.exports = router;
