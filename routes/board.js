var express = require('express');
var router = express.Router();
var async =  require('async');
var mongoose = require( 'mongoose' );
var User = mongoose.model('User');
var Topic = mongoose.model('Topic');
var Reply = mongoose.model('Reply');
var Board = mongoose.model('Board');


function BuildPager(cur,total){
        var pager = {},pagernums_length = 6,pagenum_start=0;
        pager.total=total;
        if(total<=pager_num) return null;
        var pagertotalnum = Math.ceil(total/pager_num);
        pager.cur = parseInt(cur);
        pager.prev = parseInt(cur)-1===0?null:parseInt(cur)-1;
        pager.next = parseInt(cur)+1>pagertotalnum?null:parseInt(cur)+1;
        pager.pagenums=[];

        //初始化
        var pagenum_start = 0;
        var pagenum_stop = Math.min(pagernums_length,pagertotalnum);

        //计算第一页偏移量
        if(pagernums_length<pagertotalnum && parseInt(cur)>pagernums_length/2){
            var startoffset = parseInt(cur)-pagernums_length/2;
            pagenum_start+=startoffset;
            pagenum_stop+=startoffset;
        }
        //计算是否接近最后一页,并向前推移
        if(pagernums_length<pagertotalnum && parseInt(cur)+pagernums_length/2>pagertotalnum) {
            var lastoffset = parseInt(cur)+pagernums_length/2-pagertotalnum;
            pagenum_start-=lastoffset;
            pagenum_stop-=lastoffset;
        }
        for(var i=pagenum_start;i<pagenum_stop;i++){
            if(parseInt(cur)===i+1){
                pager.pagenums.push({curnum:i+1});
                continue;
            }
            pager.pagenums.push({num:i+1});
        }
        return pager;
}

function GetTopicTemplete(topics,callback){
        var n_topics = [];
        async.eachSeries(topics,function(topic,cb){
            User.findOne({_id:topic.author_id},function(err,user){
                User.findOne({_id:topic.last_reply},function(err,replyuser){
                    if(!user) return;
                    var temp_topic = topic.toObject();
                    temp_topic.author_name = user.name;
                    temp_topic.author_url = user.url;
                    temp_topic.author_avatar_url = user.avatar_url_s;
                    temp_topic.last_reply_name = replyuser?replyuser.name:'';
                    temp_topic.create_date_format = topic.create_date_format;
                    temp_topic.create_date_fromnow = topic.create_date_fromnow;
                    temp_topic.last_reply_date_format = topic.last_reply_date_format;
                    n_topics.push(temp_topic);
                    cb();
                });
            });
        },function(err){
            callback(n_topics);
        });
}

router.get('/add', function(req, res){
    res.render('board/new');
});

router.post('/add', function(req, res){
    new Board({
        name:req.body.bname, 
        url:req.body.burl
    }).save(function(err,board){
        if(!err){
            res.redirect('/b/'+board.url); 
        } 
    });
});

//pager num
var pager_num = 10;
router.get('/:url', function(req, res) {
    Board.findOne({url:req.params.url},function(err,board){
        var s_option={};
        s_option.limit = pager_num;
        //pager
        if(req.query.p){
            s_option.skip = (req.query.p-1)*pager_num;
        }else if(board.topic_count>pager_num){
            s_option.skip = 0;
        }
        //fliter
        //default
        s_option.sort = {create_date:-1};

        if(req.query.f){
            if(req.query.f==='rd'){
                s_option.sort = {last_reply_date:-1};
            }else if(req.query.f==='rn'){
                s_option.sort = {reply_count:-1};
            }else if(req.query.f==='vn'){
                s_option.sort = {visit_count:-1};
            }
        }

        Topic.find({$and:[{board_id:board._id},{top:true}]},null,function(err,t_topics){
            GetTopicTemplete(t_topics,function(t_topics){
                Topic.find({$and:[{board_id:board._id},{top:false}]},null,s_option,function(err,n_topics){
                    GetTopicTemplete(n_topics,function(n_topics){
                        var pager = BuildPager(req.query.p?req.query.p:1,board.topic_count);
                        res.render('list', {
                            topics:n_topics,
                            toptopics:t_topics,
                            board:board,
                            pager:pager===null?null:pager
                        });
                    });
                });
            });
        });
    });
});


router.get('/:url/new', function(req, res) {
    if(!req.session.user) res.redirect('/login');

    Board.findOne({url:req.params.url},function(err,board){
        res.render('topic/new',{
            board:board 
        });
    })
});

router.get('/:url/newvote', function(req, res) {
    if(!req.session.user) res.redirect('/login');

    Board.findOne({url:req.params.url},function(err,board){
        res.render('topic/newvote',{
            board:board
        });
    })
});

router.post('/:url/new', function(req, res) {
    Board.findOneAndUpdate({url:req.params.url},{$inc:{topic_count:1}},function(err,board){
        new Topic({
            title:req.body.title,
            content:req.body.content,
            author_id:req.session.user._id,
            board_id:board._id
        }).save(function(err){
            if(!err){
                User.findOneAndUpdate({_id:req.session.user._id},{$inc:{score:5}},function(){
                    res.redirect('/b/'+board.url);
                });
            }
        }); 
    })
});

module.exports = router;
module.exports.GetTopicTemplete = GetTopicTemplete;
module.exports.BuildPager = BuildPager;
