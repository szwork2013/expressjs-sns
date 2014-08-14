var express = require('express');
var router = express.Router();
var async =  require('async');

//data
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Tips = mongoose.model('Tips');
var Message = mongoose.model('Message');

function GetAllMessageByOneUserId(id,callback){
    Message.find({$or:[{to_id:id},{from_id:id}]},null,{sort:{create_date:-1}},function(err,msgs){
        var msg_n = [];
        async.eachSeries(msgs,function(msg,callback){
            User.findOne({_id:msg.from_id},function(err,from_user){
                User.findOne({_id:msg.to_id},function(err,to_user){
                    var msg_temp = msg.toObject();
                    msg_temp.from_user_name = from_user.name;
                    msg_temp.from_user_url = from_user.url;
                    msg_temp.from_user_avatar_url = from_user.avatar_url_s;
                    msg_temp.to_user_name = to_user.name;
                    msg_temp.to_user_url = to_user.url;
                    msg_temp.to_user_avatar_url = to_user.avatar_url_s;
                    msg_temp.isowner = from_user.id === id?true:false;
                    msg_n.push(msg_temp);
                    callback();
                })
            })
        },function(){
            callback(msg_n);
        });
    });
}

function GetAllMessageByTwoUserId(fromid,toid,callback){
    Message.find({$or:[{to_id:to_id,from_id:from_id},{from_id:to_id,to_id:from_id}]},null,{sort:{create_date:-1}},function(err,msgs){
        var msg_n = [];
        async.eachSeries(msgs,function(msg,callback){
            User.findOne({_id:msg.from_id},function(err,from_user){
                User.findOne({_id:msg.to_id},function(err,to_user){
                    var msg_temp = msg.toObject();
                    msg_temp.from_user_name = from_user.name;
                    msg_temp.from_user_url = from_user.url;
                    msg_temp.from_user_avatar_url = from_user.avatar_url_s;
                    msg_temp.to_user_name = to_user.name;
                    msg_temp.to_user_url = to_user.url;
                    msg_temp.to_user_avatar_url = to_user.avatar_url_s;
                    msg_temp.isowner = from_user.id === id?true:false;
                    console.info(msg_temp);
                    msg_n.push(msg_temp);
                    callback();
                })
            })
        },function(){
            callback(msg_n);
        });
    });
}

router.get('/', function(req, res) {
    GetAllMessageByOneUserId(req.session.user._id,function(msgs){
        res.render('message/index',{
            title:'我的私信',
            msgs:msgs
        });
    })
});

router.get('/:url', function(req, res) {
    User.findOne({'url':req.params.url},function(err,user){
        GetAllMessageByTwoUserId(req.session.user._id,user._id,function(msgs){
                res.render('message/detail', {
                    title: '与'+user.name+'的对话',
                    fromuser:req.session.user,
                    touser:user,
                    msgs:msgs
                });
        })
    })
});

//添加message页面
router.get('/:url/new', function(req, res) {
    if(!req.session.user){
        res.redirect('/login');
    }else{
        User.findOne({'url':req.params.url},function(err,user){
            res.render('message/new', {
                title: '新话题',
                fromuser:req.session.user,
                touser:user
            });
        })
    }
});

router.post('/:url/new', function(req, res) {
    User.findOne({url:req.params.url},function(err,user){
        if(user){
            new Message({
                from_id:req.session.user._id,
                to_id:user._id,
                content:req.body.n_message
            }).save(function(err,message){
                if(!err){
                    new Tips({
                        type:'3',
                        user_id:user._id,
                        message_id:message._id
                    }).save(function(err){
                        if(!err) res.redirect('/message');
                    });
                }
            });
        }
    });
});

module.exports = router;
