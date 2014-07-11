require( '../db' );

var express = require('express');
var router = express.Router();
var async =  require('async');

//data
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Topic = mongoose.model('Topic');
var Reply = mongoose.model('Reply');
var Collect = mongoose.model('Collect');
var formidable = require('formidable');

function BuildReplyItem(origin,user){
    var temp = {};
    temp = origin.toObject();
    temp.create_date_format = origin.create_date_format;
    temp.author_name = user.name;
    temp.author_signature = user.signature?user.signature:null;
    temp.author_url = user.url;
    temp.avatar_url_s = user.avatar_url_s;
    return temp;
}

function GetAllreplyById(id,cb){
    Reply.find({topic_id:id},null,{sort:{create_date:1}},function(err,replys){
            var replys_o = [];
            async.eachSeries(replys, function(reply, callback) {
                User.findOne({_id:reply.author_id },'name url signature avatar_url', function(error, user) {
                   replys_o.push(BuildReplyItem(reply,user));
                   callback();
                });
            }, function (err) {
                cb(replys_o);
            });
    });
}

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
            User.findOneAndUpdate({_id:req.session.user._id},{$inc:{score:1}},function(){
               Topic.findOneAndUpdate({_id:req.body.topic_id},{$inc:{reply_count:1},last_reply_date:new Date()},function(err,topic){
                    var result = BuildReplyItem(reply,req.session.user);
                    if(req.session.user.avatar_url_s){
                       result.avatar_url_s = req.session.user.avatar_url_s;
                    }else{
                       var str = req.session.user.avatar_url;
                       result.avatar_url_s = [str.slice(0,str.lastIndexOf('.')),"_s",str.slice(str.lastIndexOf('.'))].join("");
                    }
                    if(!err){
                        res.json(result);
                    }
               })
           })
        }); 
});

//up reply
router.post('/upreply',function(req,res){
    Reply.findOne({_id:req.body.reply_id},function(err,reply){
        var isup = reply.uper.some(function (uper) { return uper.uper_id.equals(req.session.user._id);});
        var isself = reply.author_id.equals(req.session.user._id)?true:false;
        if(isself){
           res.json({r:2});
        }else if(isup){
           res.json({r:0});
        }else{
            Reply.findOneAndUpdate({_id:reply._id},{$inc:{up:req.body.num},$push:{uper:{uper_id:req.session.user._id}}},function(err,reply_updated){
                if(!err){
                   res.json({r:1,reply:reply_updated});
                } 
            })
        }
    }); 
});

//获取topic页面
router.get('/:_id', function(req, res, next) {
    var islogin  = req.session.user?true:false;
    Topic.findOneAndUpdate({_id:req.params._id},{$inc:{visit_count:1}},function(err,topic){
        if(topic){
            GetAllreplyById(topic.id,function(replys){
                if(islogin){
                    Collect.find({$and:[{user_id:req.session.user._id},{topic_id:topic.id}]},function(err,collect){
                        res.render('topic/index',{
                            topic:topic,
                            replys:replys,
                            iscollect:collect.length>0?true:false
                        })
                    });
                }else{
                        res.render('topic/index',{
                            topic:topic,
                            replys:replys,
                            iscollect:false
                        })
                }
            });
        }else{
            next(); 
        }
    });
});

module.exports = router;
