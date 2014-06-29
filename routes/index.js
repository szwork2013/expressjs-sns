require( '../db' );

var express = require('express');
var router = express.Router();
var async =  require('async');

//data
var mongoose = require( 'mongoose' );
var User = mongoose.model('User');
var Topic = mongoose.model('Topic');
var Channel = mongoose.model('Channel');

//获取标题列表
router.get('/', function(req, res) {
    Channel.find({},function(err,chs){
        res.render('index',{
            channels:chs
        }); 
    });
});

router.get('/register', function(req, res) {
    res.render('user/register', { title: '注册' });
});

router.get('/login', function(req, res) {
    res.render('user/login', { title: '登陆' });
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


router.get('/search', function(req, res) {
    Topic.find({title: new RegExp(req.query.q, 'i')},function(err,topics){
        if(topics.length>0){
            res.render('list', { 
                title: '搜索结果',
                topics:topics
            });
        }else{
            res.render('error',{
                error:'抱歉，没有结果请重试！'
            });
        }
    });
});

module.exports = router;
