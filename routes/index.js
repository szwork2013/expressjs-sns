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
             User.findOne({_id:topic.author_id},'name url',function(err,user){
                 var temp_topic = topic.toObject();
                 temp_topic.author_name = user.name;
                 temp_topic.author_url = user.url;
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

router.post('/register', function(req, res) {
       new User({
           email:req.body.uemail,
           name:req.body.uname,
           pwd:req.body.upwd,
           phone:req.body.uphone
       }).save( function( err,user){
           if(err){
                res.redirect('/error');
            }else{
                User.findOneAndUpdate({_id:user._id},{url:user._id},function(){
                    res.redirect('/');
                })
            }
        });
});

router.get('/login', function(req, res) {
    res.render('user/login', { title: '登陆' });
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
            res.redirect('back');
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
