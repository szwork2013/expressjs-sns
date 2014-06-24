require( '../db' );

var express = require('express');
var router = express.Router();
var async =  require('async');

//data
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Topic = mongoose.model('Topic');
var Reply = mongoose.model('Reply');
var Message = mongoose.model('Message');

router.get('/', function(req, res) {
    Message.find({to_id:req.session.user._id},function(err,msgs){
        res.render('message/index',{
            messages:msgs 
        });
    });
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
                    res.redirect('back');        
                } 
            });
        } 
    });

});



module.exports = router;
