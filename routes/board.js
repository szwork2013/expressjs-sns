var express = require('express');
var router = express.Router();
var async =  require('async');
var mongoose = require( 'mongoose' );
var User = mongoose.model('User');
var Topic = mongoose.model('Topic');
var Reply = mongoose.model('Reply');
var Board = mongoose.model('Board');

var common = require('../routes/common');
var GetTopicTemplete = common.GetTopicTemplete;
var BuildPager = common.BuildPager;
var BuildReplyItem = common.BuildReplyItem;

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

router.get('/lastreplys', function(req, res){
    Reply.find({board_id:req.query.board_id},null,{sort:{create_date:-1},limit:6},function(err,replys){
        var n_replys=[];
        async.eachSeries(replys,function(reply,cb){
            User.findOne({_id:reply.author_id },'name url signature avatar_url avatar_url_s', function(error, user) {
                if(!user) return cb();
                BuildReplyItem(reply,user,function(r){
                    n_replys.push(r)
                    cb();
                });
            });
        },function(err){
            res.json({replys:n_replys});
        })
    });
});

//pager num
var pager_num = 10;
router.get('/:url', function(req, res,next) {
    Board.findOne({url:req.params.url},function(err,board){
        if(!board) return next();
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
            }else if(req.query.f==='cd'){
                s_option.sort = {create_date:-1};
            }
        }

        Topic.find({$and:[{board_id:board._id},{top:true}]},null,function(err,t_topics){
            GetTopicTemplete(t_topics,function(t_topics){
                Topic.find({$and:[{board_id:board._id},{top:false}]},null,s_option,function(err,n_topics){
                    GetTopicTemplete(n_topics,function(n_topics){
                        var pager = BuildPager(req.query.p?req.query.p:1,board.topic_count,pager_num);
                        res.render('list', {
                            title:board.name,
                            topics:n_topics,
                            toptopics:t_topics,
                            board:board,
                            filter:req.query.f,
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
            title:'发布新帖('+board.name+')',
            board:board
        });
    })
});

router.get('/:url/newvote', function(req, res) {
    if(!req.session.user) res.redirect('/login');

    Board.findOne({url:req.params.url},function(err,board){
        res.render('topic/newvote',{
            title:'新建投票票',
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
