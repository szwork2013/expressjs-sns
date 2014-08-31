var express = require('express');
var router = express.Router();
var async =  require('async');

//data
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Reply = mongoose.model('Reply');
var Tips = mongoose.model('Tips');
var Topic = mongoose.model('Topic');
var Reply = mongoose.model('Reply');
var Message = mongoose.model('Message');

router.get('/', function(req, res) {
    Tips.find({user_id:req.session.user._id},null,{sort:{create_date:-1}},function(err,tips){
        var tips_o = [];
        async.eachSeries(tips,function(tip,cb){
            Tips.update({_id:tip._id},{has_read:true},function(){
                switch (tip.type){
                    case '1':
                        Topic.findOne({_id:tip.topic_id},function(err,topic){
                            var tiptemp = tip.toObject();
                            tiptemp.ttitle=topic.title;
                            tips_o.push(tiptemp);
                            cb();
                        })
                    break;
                    case '2':
                        Reply.findOne({_id:tip.reply_id},function(err,reply){
                            var tiptemp = tip.toObject();
                            tiptemp.rcontent = reply.content;
                            tips_o.push(tiptemp);
                            cb();
                        })
                    break;
                    case '3':
                        Message.findOne({_id:tip.message_id},function(err,message){
                            User.findOne({_id:message.from_id},function(err,from_user){
                                var tiptemp = tip.toObject();
                                tiptemp.mauthor = from_user.name;
                                tips_o.push(tiptemp);
                                cb();
                            })
                        })
                    break;
                }
            })
        },function(){
            res.render('tips/index',{
                title:'我的提醒',
                tips:tips_o
            });
        })
    });
});

router.get('/unreadtips', function(req, res) {
    Tips.find({$and:[{user_id:req.session.user._id},{has_read:false}]},function(err,tips){
        res.json({tipsnum:tips.length});
    });
});

router.post('/del', function(req, res) {
    Tips.findOneAndRemove({_id:req.body.id},function(err,tip){
        if(tip){
           res.json({r:1});
        }else{
           res.json({r:0});
        }
    });
});

router.post('/delall', function(req, res) {
    Tips.remove({user_id:req.session.user._id},function(err,tips){
        if(tips){
           res.json({r:1});
        }else{
           res.json({r:0});
        }
    });
});

module.exports = router;
