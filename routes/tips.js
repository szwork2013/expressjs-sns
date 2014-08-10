var express = require('express');
var router = express.Router();
var async =  require('async');

//data
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Reply = mongoose.model('Reply');
var Tips = mongoose.model('Tips');

router.get('/', function(req, res) {
    Tips.find({user_id:req.session.user._id},null,{sort:{create_date:-1}},function(err,tips){
        res.render('tips/index',{
            title:'我的提醒',
            tips:tips
        });
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
