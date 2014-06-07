require( '../db' );

var express = require('express');
var router = express.Router();

//data
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Topic = mongoose.model('Topic');

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
       author_id:req.session.user._id
   }).save(function(err){
        if(!err){
            res.redirect('/');
        }
   }); 
});

router.get('/:_id', function(req, res) {
    Topic.findOne({_id:req.params._id},function(err,topic){
        res.render('topic/detail',{
            topic:topic
        })
    });
});

module.exports = router;
