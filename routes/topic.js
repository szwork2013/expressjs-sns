var express = require('express');
var router = express.Router();
var async =  require('async');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Topic = mongoose.model('Topic');
var Board = mongoose.model('Board');
var Reply = mongoose.model('Reply');
var Collect = mongoose.model('Collect');
var Tips = mongoose.model('Tips');
var formidable = require('formidable');
var gm = require( 'gm' );
var path = require( 'path' );
var fs = require( 'fs' );
var moment =  require('moment');

var common = require('../routes/common');
var BuildPager = common.BuildPager;
var BuildReplyItem = common.BuildReplyItem;

var replys_pager_num = 20;
function GetReplyById(id,p,cb){
    Topic.findOne({_id:id},function(err,topic){

        q_option ={};
        q_option.limit = replys_pager_num; 
        if(topic.reply_count>replys_pager_num){
            q_option.skip = (p-1)*replys_pager_num; 
        }
        q_option.sort={create_date:1};
        Reply.find({topic_id:id},null,q_option,function(err,replys){
            var replys_o = [];
            if(replys && replys.length>0){ 
                async.eachSeries(replys, function(reply, callback) {
                    User.findOne({_id:reply.author_id },function(error, user) {
                        if(!user) return callback();
                        replys_o.push(BuildReplyItem(reply,user));
                        callback();
                    });
                }, function (err) {
                    cb(replys_o,BuildPager(p,topic.reply_count,replys_pager_num));
                });
            }else{
                cb(replys_o,BuildPager(p,topic.reply_count,replys_pager_num));
            }
        });
    });
}

function GetHotreplyById(id,cb){
    Reply.find({topic_id:id,up:{$gt:0}},null,{limit:3,sort:{up:-1}},function(err,hreplys){
        var replys_o = [];
        if(hreplys && hreplys.length>0){
            async.eachSeries(hreplys, function(reply, callback) {
                User.findOne({_id:reply.author_id },'name url signature avatar_url', function(error, user) {
                    replys_o.push(BuildReplyItem(reply,user));
                    callback();
                });
            }, function (err) {
                cb(replys_o);
            });
        }else{
            cb(replys_o); 
        }
    });
}

router.post('/addlike',function(req,res){
    if(!req.session.user){
        res.json({r:3}); 
        return;
    }
    Topic.findOne({_id:req.body.topic_id},function(err,topic){
        var islike = topic.liker.some(function (liker) { return liker.liker_id.equals(req.session.user._id);});
        var isself = topic.author_id.equals(req.session.user._id)?true:false;
        if(isself){
            res.json({r:2});
        }else if(islike){
            res.json({r:0});
        }else{
            Topic.update({_id:topic._id},{$push:{liker:{liker_id:req.session.user._id}}},function(err,topic_n){
                if(!err && topic_n){
                    res.json({r:1});
                } 
            })
        }
    }); 
});

//添加留言api
router.post('/addreply',function(req,res){
    if(!req.session.user){
        res.json({r:3}); 
        return;
    }
    var sqlstr = {
        content:req.body.replyContent,
        topic_id:req.body.topic_id,
        board_id:req.body.board_id,
        author_id:req.session.user._id
    };
    if(req.body.reply_id) sqlstr.reply_id=req.body.reply_id;

    new Reply(sqlstr).save(function(err,reply){
        User.findOneAndUpdate({_id:req.session.user._id},{$inc:{score:1}},function(err,user){
            Topic.findOneAndUpdate({_id:req.body.topic_id},{$inc:{reply_count:1},last_reply_date:Date.now(),last_reply:req.session.user._id},function(err,topic){
                if(req.body.reply_id){
                    Reply.findOne({_id:req.body.reply_id},function(err,reply){
                        new Tips({
                            type:'2',
                            user_id:reply.author_id,
                            topic_id:topic._id,
                            reply_id:reply._id
                        }).save(function(err){
                            if(!err) {
                                var result = BuildReplyItem(reply,req.session.user);
                                result.avatar_url_s = req.session.user.avatar_url_s;
                                if(!err){
                                    res.json(result);
                                }
                            }
                        });
                    })
                }else{
                    new Tips({
                        type:'1',
                        user_id:topic.author_id,
                        topic_id:topic._id
                    }).save(function(err){
                        if(!err) {
                            var result = BuildReplyItem(reply,req.session.user);
                            result.avatar_url_s = req.session.user.avatar_url_s;
                            if(!err){
                                res.json(result);
                            }
                        }
                    });
                }
            });
        });
    });
});

//upreply
router.post('/upreply',function(req,res){
    if(!req.session.user){
        res.json({r:3}); 
        return;
    }
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

//ajax fetch replys
router.get('/getreplys',function(req,res,next){
    if(!req.query.id){
        res.json({replys:null})
        return;
    }
    GetReplyById(req.query.id,req.query.p?req.query.p:1,function(replys,pager){
        res.json({replys:replys,pager:pager}) 
    });
});

//获取topic页面
router.get('/:_id', function(req, res, next) {
    var islogin  = req.session.user?true:false;
    var queryuser = islogin?{user_id:req.session.user._id}:{};
    Topic.findOneAndUpdate({_id:req.params._id},{$inc:{visit_count:1}},function(err,topic){
        if(!topic){
            res.render('error',{
               message:'抱歉，帖子不存在！'
            });
            return;
        }
        User.findOne({_id:topic.author_id},function(err,author){
            var islike = islogin && topic.liker && topic.liker.some(function (liker) { return liker.liker_id.equals(req.session.user._id);});
            Board.findOne({_id:topic.board_id},function(err,board){
                if(topic){
                    GetHotreplyById(topic.id,function(hotreplys){
                        Collect.find({$and:[queryuser,{topic_id:topic.id}]},function(err,collect){
                            res.render('topic/index',{
                                title:topic.title,
                                topic:topic,
                                author:author,
                                board:board,
                                hotreplys:hotreplys,
                                iscollect:islogin && collect.length>0?true:false,
                                islike:islogin && islike?true:false
                            })
                        });
                    })
                }else{
                    next(); 
                }
            });
        });
    });
});

//new topic upload img
router.post('/uploadimg', function(req, res, next) {
    new formidable.IncomingForm().parse(req,function(err,fields,files){
        var img = files.img;
        var y_floder = process.cwd()+'/public/assets/'+moment(Date.now()).format('YYYY');
        var m_floder = y_floder+'/'+moment(Date.now()).format('MM');
        var d_floder = m_floder+'/'+moment(Date.now()).format('DD');
        var imgname = Date.now()+path.extname(img.name);
        var showurl = '/assets/'+moment(Date.now()).format('YYYY')+'/'+moment(Date.now()).format('MM')+'/'+moment(Date.now()).format('DD')+'/'+imgname;
        if(!fs.existsSync(d_floder)){
            if(!fs.existsSync(m_floder)){
                if(!fs.existsSync(y_floder)){
                    fs.mkdirSync(y_floder);
                }
                fs.mkdirSync(m_floder);
            }
            fs.mkdirSync(d_floder);
        }
        var writeurl = d_floder+'/'+imgname;
        gm(img.path).write(writeurl,function(){
            res.json({r:1,writeurl:writeurl,url:showurl});
        });
    });
});

module.exports = router;
