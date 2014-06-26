require( '../db' );

var express = require('express');
var router = express.Router();
var async =  require('async');

//data
var mongoose = require( 'mongoose' );
var User = mongoose.model('User');
var Topic = mongoose.model('Topic');

var formidable = require('formidable');

//获取标题列表
router.get('/', function(req, res) {
     Topic.find({},null,{sort:{create_date:-1}},function(err,topics){
         var n_topics = [];
         async.eachSeries(topics,function(topic,cb){
             User.findOne({_id:topic.author_id},'name url avatar_url',function(err,user){
                 var temp_topic = topic.toObject();
                 temp_topic.author_name = user.name;
                 temp_topic.author_url = user.url;
                 temp_topic.author_avatar_url = user.avatar_url_s;
                 temp_topic.create_date_format = topic.create_date_format;
                 n_topics.push(temp_topic);
                 cb();
             });
         },function(err){
            res.render('index', {
                topics:n_topics
            });
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
            res.render('index', { 
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
