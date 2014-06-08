require( '../db' );

var express = require('express');
var router = express.Router();

//data
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Topic = mongoose.model('Topic');
var Reply = mongoose.model('Reply');

var formidable = require('formidable');

router.get('/new', function(req, res) {
    res.render('topic/new', { 
        title: '新话题'
    });
});

router.post('/new', function(req, res) {
   new Topic({
       title:req.body.title,
       content:req.body.content,
       author_id:req.session.user._id,
       author_name:req.session.user.name,
   }).save(function(err){
        if(!err){
            res.redirect('/');
        }
   }); 
});

router.get('/:_id', function(req, res) {
    Topic.findOne({_id:req.params._id},function(err,topic){
        if(topic){
            Reply.find({topic_id:topic._id},function(err,replys){
                res.render('topic/detail',{
                    topic:topic,
                    replys:replys,
                    title:topic.title
                })
            }) 
        }
    });
});

router.post('/addreply',function(req,res){
   new Reply({
       content:req.body.replyContent,
       topic_id:req.body.topic_id,
       author_id:req.session.user._id,
       author_name:req.session.user.name
   }).save(function(err){
        if(!err){
            res.json({s:1,content:req.body.replyContent,author_name:req.session.user.name})
        }
   }); 
});

module.exports = router;
