var express = require('express');
var router = express.Router();
var async =  require('async');

//data
var mongoose = require( 'mongoose' );
var User = mongoose.model('User');
var Topic = mongoose.model('Topic');
var Reply = mongoose.model('Reply');
var Board = mongoose.model('Board');
var Relation = mongoose.model('Relation');


function GetTopicAndReplyByUser(user,callback){
    Topic.find({author_id:user._id},null,{sort:{create_date:-1}},function(err,topics){
        Reply.find({author_id:user._id},null,{sort:{create_date:-1}},function(err,replys){
            callback(topics,replys);
        })
    })
}

var GetTopicTemplete = require('../routes/board').GetTopicTemplete;

//获取标题列表
router.get('/', function(req, res) {
    Board.find({},function(err,bs){
        res.render('index',{
            boards:bs
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
        //清除session,退出
        res.redirect('/');
    });
});

router.get('/search', function(req, res) {
    Topic.find({title: new RegExp(req.query.q, 'i')},function(err,topics){
        if(topics.length>0){
            GetTopicTemplete(topics,function(rtopics){
                res.render('list', { 
                    title: '搜索结果',
                    topics:rtopics
                });
            })
        }else{
            res.render('error',{
                error:'抱歉，没有结果请重试！'
            });
        }
    });
});

router.get('/settings', function(req, res,next) {
    if(req.session.user){
        User.findOne({_id:req.session.user._id},function(err,user){
            res.render('./user/settings', { 
                title: '账户设置',
                user:user
            });
        });
    }else{
        next();
    }
});

router.get('/:url', function(req, res,next) {
    User.findOne({url:req.params.url},function(err,user){
        if(!user){
            next();
        }else{
            GetTopicAndReplyByUser(user,function(topics,replys){
                res.render('./user/index', { 
                    title: user.name,
                    user:req.session.user,
                    showuser:user,
                    topics:topics,
                    replys:replys,
                    isme:req.session.user && user._id.equals(req.session.user._id)?[1]:null
                });
            });
        }
    });
});

module.exports = router;
