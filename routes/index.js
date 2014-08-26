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
    Topic.find({author_id:user._id},null,{sort:{create_date:-1},limit:10},function(err,topics){
        Reply.find({author_id:user._id},null,{sort:{create_date:-1},limit:10},function(err,replys){
            callback(topics,replys);
        })
    })
}

var common = require('../routes/common');
var GetTopicTemplete = common.GetTopicTemplete;

//获取标题列表
router.get('/', function(req, res) {
    Board.find({},function(err,bs){
        res.render('index',{
            boards:bs
        });
    });
});

router.get('/register', function(req, res) {
    res.render('user/register', { title: '注册',bg:Math.floor(Math.random()*10)+1});
});

router.get('/login', function(req, res) {
    res.render('user/login', { title: '登陆',bg:Math.floor(Math.random()*10)+1});
});

router.get('/logout', function(req, res) {
    req.session.destroy(function(err){
        res.locals.user = null;
        //清除session,退出
        res.redirect('/');
    });
});

router.get('/baned', function(req, res) {
    res.render('error',{
        message:'抱歉，您的账号已经被注销！'
    });
});

router.get('/search', function(req, res) {
    Topic.find({title: new RegExp(req.query.q, 'i')},function(err,topics){
        if(topics.length>0){
            GetTopicTemplete(topics,function(rtopics){
                res.render('list', {
                    title: '搜索结果',
                    topics:rtopics,
                    issearch:true
                });
            })
        }else{
            res.render('error',{
                message:'抱歉，没有结果请重试！'
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
                if(req.session.user){
                    Relation.findOne({$and:[{user_id:req.session.user._id},{focus_user_id:user._id}]},function(err,relation){
                        res.render('./user/index', {
                            title:user.name,
                            showuser:user,
                            topics:topics,
                            replys:replys,
                            isme:user._id.equals(req.session.user._id)?[1]:null,
                            isfocus:relation?true:false
                        });
                    });
                }else{
                        res.render('./user/index', {
                            title:user.name,
                            showuser:user,
                            topics:topics,
                            replys:replys,
                            isme:null,
                            isfocus:false
                        });
                }
            });
        }
    });
});

module.exports = router;
