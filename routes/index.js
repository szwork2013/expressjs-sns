require( '../db' );

var express = require('express');
var router = express.Router();

var mongoose = require( 'mongoose' );
var UserModel = mongoose.model('User');
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

        var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        console.info(fields);
        console.info(files);
    });
    /*
       new UserModel({
           email:req.body.uemail,
           name:req.body.uname,
           pwd:req.body.upwd,
           signature:req.body.signature
       }).save( function( err, todo, count ){
       if(err){
            //res.json({success:0});
            res.redirect( '/error' );
            }else{
            //res.json({success:1});
            res.redirect( '/user' );
            }
        });
    */
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
    UserModel.findOne({name:username},function(err,user){
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
