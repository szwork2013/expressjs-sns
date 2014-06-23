require( '../db' );

var express = require('express');
var router = express.Router();
var async =  require('async');

//data
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Topic = mongoose.model('Topic');
var Reply = mongoose.model('Reply');
var formidable = require('formidable');

function GetAllreplyById(id,cb){
        Reply.find({topic_id:id},null,{sort:{create_date:-1}},function(err,replys){
                var replys_o = [];
                async.eachSeries(replys, function(reply, callback) {
                    User.findOne({_id:reply.author_id },'name avatar_url', function(error, user) {
                       var reply_temp = reply.toObject();
                       reply_temp.create_date_format = reply.create_date_format;
                       reply_temp.author_name = user.name;
                       reply_temp.avatar_url = user.avatar_url;
                       replys_o.push(reply_temp);
                       callback();
                    });
                }, function (err) {
                    cb(replys_o);
                });
        });
}

//获取添加topic页面
router.get('/new', function(req, res) {
    if(!req.session.user){
        res.redirect('/login');
    }else{
        res.render('topic/new', { 
            title: '新话题'
        });
    }
});

//提交添加topic
router.post('/new', function(req, res) {
   new Topic({
       title:req.body.title,
       content:req.body.content,
       author_id:req.session.user._id
   }).save(function(err){
        if(!err){
            res.redirect('/');
        }
   }); 
});

//获取topic留言
router.get('/getallreply',function(req,res){
    GetAllreplyById(req.query.topic_id,function(replys){
            res.json(replys);
    });
});


//添加留言api
router.post('/addreply',function(req,res){
   new Reply({
       content:req.body.replyContent,
       topic_id:req.body.topic_id,
       author_id:req.session.user._id
   }).save(function(err,reply){
       Topic.findOneAndUpdate({_id:req.body.topic_id},{$inc:{reply_count:1}},function(err,topic){
           var result = reply.toObject();
           result.create_date_format = reply.create_date_format;
           result.author_name = req.session.user.name;
           result.avatar_url = req.session.user.avatar_url;
            if(!err){
                res.json(result);
            }
       })
   }); 
});

//获取topic页面
router.get('/:_id', function(req, res, next) {
    if(!req.session.user){
        res.redirect('/login');
    }else{
        Topic.findOneAndUpdate({_id:req.params._id},{$inc:{visit_count:1}},function(err,topic){
            if(topic){
                GetAllreplyById(topic.id,function(replys){
                    res.render('topic/index',{
                        title:topic.title,
                        topic:topic,
                        replys:replys
                    })
                });
            }else{
                next(); 
            }
        });
    }
});

module.exports = router;
