require( '../db' );

var express = require('express');
var router = express.Router();
var async =  require('async');

//data
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Topic = mongoose.model('Topic');
var Reply = mongoose.model('Reply');
var Collect= mongoose.model('Collect');

function GetCollectTempleteByUserId(res,req,callback){
    Collect.find({user_id:req.session.user._id},function(err,cols){
        var cols_n = [];
        async.eachSeries(cols, function(col, callback){
            Topic.findOne({_id:col.topic_id},function(err,topic){
                var col_temp = col.toObject();
                col_temp.topic_title = topic.title;
                cols_n.push(col_temp);
                callback();
            })
        },function(){
            callback(cols_n);
        });
    })
}

router.get('/', function(req, res) {
    GetCollectTempleteByUserId(res,req,function(cols){
        res.render('collect/index',{
            collects:cols
        });
    });
            
});

router.post('/new', function(req, res) {

    if(!req.session.user){
        res.json({s:3});
        return; 
    }
    Collect.findOne({$and:[{topic_id:req.body.topic_id},{user_id:req.session.user._id}]},function(err,col){
        conosle.info(err);
        if(col){
            res.json({s:2});
        }else{
            new Collect({
                user_id:req.session.user._id,
                topic_id:req.body.topic_id
            }).save(function(err){
                if(!err){
                    res.json({s:1}); 
                }else{
                    res.json({s:0});
                }
            });
        }
    })
});

router.post('/del', function(req, res) {
    Collect.remove({
        user_id:req.session.user._id,
        topic_id:req.body.topic_id
    },function(err){
        if(!err){
            res.json({s:1}); 
        }else{
            res.json({s:0});
        }
    })
})

module.exports = router;
