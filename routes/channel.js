var express = require('express');
var router = express.Router();
var async =  require('async');

var mongoose = require( 'mongoose' );
var User = mongoose.model('User');
var Topic = mongoose.model('Topic');
var Reply = mongoose.model('Reply');
var Channel = mongoose.model('Channel');

//pager num
var pager_num = 5;

function BuildPager(cur,total){
        var pager = {};
        if(total<=pager_num) return null;
        var pagertotalnum = Math.ceil(total/pager_num);
        pager.cur = parseInt(cur);
        pager.prev = parseInt(cur)-1===0?null:parseInt(cur)-1;
        pager.next = parseInt(cur)+1>pagertotalnum?null:parseInt(cur)+1;
        pager.pagenums=[];
        for(var i=0;i<pagertotalnum;i++){
            pager.pagenums.push({num:i+1});
        }
        return pager;
}

function GetTopicTemplete(topics,callback){
        var n_topics = [];
        async.eachSeries(topics,function(topic,cb){
            User.findOne({_id:topic.author_id},function(err,user){
                var temp_topic = topic.toObject();
                temp_topic.author_name = user.name;
                temp_topic.author_url = user.url;
                temp_topic.author_avatar_url = user.avatar_url_s;
                temp_topic.create_date_format = topic.create_date_format;
                n_topics.push(temp_topic);
                cb();
            });
        },function(err){
            callback(n_topics);
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
    Channel.findOne({url:req.params.url},function(err,channel){
        var s_option={sort:{create_date:-1}};
        //pager
        if(req.query.p){
            s_option.limit = pager_num;
            s_option.skip = (req.query.p-1)*pager_num;
        }else if(channel.topic_count>pager_num){
            s_option.limit = pager_num;
            s_option.skip = 0;
        }
        //fliter

        Topic.find({channel_id:channel._id},null,s_option,function(err,topics){
            GetTopicTemplete(topics,function(n_topics){
                res.render('list', {
                    topics:n_topics,
                    channel:channel,
                    pager:BuildPager(req.query.p?req.query.p:1,channel.topic_count)
                });
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

module.exports = router;
