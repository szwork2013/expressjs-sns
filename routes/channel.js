var express = require('express');
var router = express.Router();
var async =  require('async');

var mongoose = require( 'mongoose' );
var User = mongoose.model('User');
var Topic = mongoose.model('Topic');
var Reply = mongoose.model('Reply');
var Channel = mongoose.model('Channel');


router.get('/', function(req, res) {
     Topic.find({},null,{sort:{create_date:-1}},function(err,topics){
         var n_topics = [];
         async.eachSeries(topics,function(topic,cb){
             User.findOne({_id:topic.author_id},'name url avatar_url',function(err,user){
                 var temp_topic = topic.toObject();
                 temp_topic.author_name = user.name;
                 temp_topic.author_url = user.url;
                 temp_topic.author_avatar_url = user.avatar_url_s;
                 temp_topic.create_date_format = topic.create_date_format;
                 n_topics.push(temp_topic);
                 cb();
             });
         },function(err){
            res.render('list', {
                topics:n_topics
            });
         });
    });
});

router.get('/add', function(req, res){
        res.render('channel/new');
});

router.post('/add', function(req, res){
    new Channel({
        name:req.body.cname, 
        url:req.body.curl
    }).save(function(err,channel){
        if(!err){
            res.redirect('/channel/'+channel.url); 
        } 
    })

});

router.get('/:url', function(req, res) {
     Topic.find({},null,{sort:{create_date:-1}},function(err,topics){
         var n_topics = [];
         async.eachSeries(topics,function(topic,cb){
             User.findOne({_id:topic.author_id},'name url avatar_url',function(err,user){
                 var temp_topic = topic.toObject();
                 temp_topic.author_name = user.name;
                 temp_topic.author_url = user.url;
                 temp_topic.author_avatar_url = user.avatar_url_s;
                 temp_topic.create_date_format = topic.create_date_format;
                 n_topics.push(temp_topic);
                 cb();
             });
         },function(err){
            res.render('list', {
                topics:n_topics,
                channel_url:req.params.url
            });
         });
    });
});

router.get('/:url/new', function(req, res) {
    res.render('topic/new',{
        channel_url:req.params.url 
    });
});

router.post('/:url/new', function(req, res) {
    Channel.findOne({url:req.params.url},function(err,channel){
       new Topic({
           title:req.body.title,
           content:req.body.content,
           author_id:req.session.user._id,
           channel_id:channel._id
       }).save(function(err){
            if(!err){
                res.redirect('/channel/'+channel.url);
            }
       }); 
    })
});


module.exports = router;
