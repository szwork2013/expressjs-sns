var express = require('express');
var router = express.Router();
var async =  require('async');

var mongoose = require( 'mongoose' );
var User = mongoose.model('User');
var Topic = mongoose.model('Topic');
var Reply = mongoose.model('Reply');
var Channel = mongoose.model('Channel');

//pager num
var pager_num = 4;
//var cursor = {};

function RenderPage(req,res,topics,channel,pager,callback){
        var r_topics = [];
        async.eachSeries(topics,function(topic,cb){
            User.findOne({_id:topic.author_id},function(err,user){
                var temp_topic = topic.toObject();
                temp_topic.author_name = user.name;
                temp_topic.author_url = user.url;
                temp_topic.author_avatar_url = user.avatar_url_s;
                temp_topic.create_date_format = topic.create_date_format;
                r_topics.push(temp_topic);
                cb();
            });
        },function(err){
            //cursor.prev=pager.cur;
            //cursor.first= topics[0];
            //cursor.last= topics[topics.length-1];
            res.render('list', {
                topics:r_topics,
                channel:channel,
                pager:pager
            });
        });
}

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
    res.redirect('/channel/'+req.params.url+'/1');
});

router.get('/:url/new', function(req, res) {
    res.render('topic/new',{
        channel_url:req.params.url 
    });
});

router.post('/:url/new', function(req, res) {
    Channel.findOneAndUpdate({url:req.params.url},{$inc:{topic_count:1}},function(err,channel){
        new Topic({
            title:req.body.title,
            content:req.body.content,
            author_id:req.session.user._id,
            channel_id:channel._id
        }).save(function(err){
            if(!err){
                User.findOneAndUpdate({_id:req.session.user._id},{$inc:{score:5}},function(){
                    res.redirect('/channel/'+channel.url);
                });
            }
        }); 
    })
});

router.get('/:url/:page', function(req, res) {
    var skipnum =(req.params.page-1)*pager_num;
    Channel.findOne({url:req.params.url},function(err,channel){

        //build pager
        var pager = {};
        var pagertotalnum = Math.ceil(channel.topic_count/pager_num);
        pager.cur = parseInt(req.params.page);
        pager.prev = parseInt(req.params.page)-1===0?null:parseInt(req.params.page)-1;
        pager.next = parseInt(req.params.page)+1>pagertotalnum?null:parseInt(req.params.page)+1;
        pager.pagenums=[];
        for(var i=0;i<pagertotalnum;i++){
            pager.pagenums.push({num:i+1});
        }

        //next prev skip
        /*
        if(parseInt(req.params.page)-parseInt(cursor.prev) === 1 && cursor.last){
                Topic.find({channel_id:channel._id,create_date:{$lt:cursor.last.create_date}},null,{limit:pager_num,sort:{create_date:-1}},function(err,topics){
                    RenderPage(req,res,topics,channel,pager);
                });
        }else if(parseInt(req.params.page)-parseInt(cursor.prev) === -1 && cursor.first){
                Topic.find({channel_id:channel._id,create_date:{$gt:cursor.first.create_date}},null,{limit:pager_num,sort:{create_date:-1}},function(err,topics){
                    console.info(topics);
                    RenderPage(req,res,topics,channel,pager);
                });
        }else{
                Topic.find({channel_id:channel._id},null,{limit:pager_num,skip:skipnum,sort:{create_date:-1}},function(err,topics){
                    RenderPage(req,res,topics,channel,pager);
                });
        }
        */
        Topic.find({channel_id:channel._id},null,{limit:pager_num,skip:skipnum,sort:{create_date:-1}},function(err,topics){
            RenderPage(req,res,topics,channel,pager);
        });
    });
});

module.exports = router;
