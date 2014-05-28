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
       new User({
           email:req.body.uemail,
           name:req.body.uname,
           pwd:req.body.upwd,
           phone:req.body.uphone
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
    User.findOne({$or:[{ name:username }, {email:username }]},function(err,user){
        var error_msg = '';

        if(!user || userpwd != user.pwd){
            if(!user) {
                error_msg = '用户不存在';
            }else if(userpwd != user.pwd){
                error_msg = '密码错误';
            }
            res.render('error',{
                error:error_msg
            });
        }else{
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


router.post('/validate', function(req, res) {

    if(req.body.name){
        User.findOne({name:req.body.name},function(err,user){
            if(user){
                res.json({'namesuccess':1});
            }else{
                res.json({'namesuccess':0});
            }
        });
    }
    if(req.body.email){
        User.findOne({email:req.body.email},function(err,user){
            if(user){
                res.json({'emailsuccess':1});
            }else{
                res.json({'emailsuccess':0});
            }
        });
    }

});

/*
router.use(function(req, res) {
    console.info(123);
});
*/

module.exports = router;
