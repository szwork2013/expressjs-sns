var express = require('express');
var router = express.Router();
var async =  require('async');

var mongoose = require( 'mongoose' );
var User = mongoose.model('User');
var Relation = mongoose.model('Relation');

router.post('/:url/new',function(req,res){
    if(!req.session.user){
        res.json({r:2});
        return;
    }
    User.findOne({url:req.params.url},function(err,user){
        Relation.findOne({$and:[{following:req.session.user._id},{follower:user._id}]},function(err,relation){
            if(relation){
                res.json({r:0});
            }else{
                new Relation({
                    following:req.session.user._id,
                    follower:user._id
                }).save(function(err,relation){
                    User.update({_id:req.session.user._id},{$push:{following:{user_id:user._id}}},function(err,fuser){
                        User.update({_id:user._id},{$push:{follower:{user_id:req.session.user._id}}},function(err,fduser){
                            if(relation && fuser && fduser) res.json({r:1});
                        })
                    })
                });
            }
        });
    });
});

router.post('/:url/del',function(req,res){
    if(!req.session.user){
        res.json({r:2});
        return;
    }
    User.findOne({url:req.params.url},function(err,user){
        Relation.findOneAndRemove({$and:[{following:req.session.user._id},{follower:user._id}]},function(err,relation){
            if(err){
                res.json({r:0});
            }else{
                    User.update({_id:req.session.user._id},{$pull:{following:{user_id:user._id}}},function(err,fuser){
                        User.update({_id:user._id},{$pull:{follower:{user_id:req.session.user._id}}},function(err,fduser){
                            if(relation && fuser && fduser) res.json({r:1});
                        })
                });
            }
        });
    });
});

router.get('/:url/follower',function(req,res){
    User.findOne({url:req.params.url},function(err,user){
        Relation.find({follower:user._id},function(err,relation){
            var relation_users = [];
            async.eachSeries(relation,function(relation_item,cb){
                User.findOne({_id:relation_item.following},'name url signature avatar_url avatar_url_s', function(error, user_o) {
                    if(!user_o) return cb();
                    relation_users.push(user_o)
                    cb();
                });
            },function(err){
                res.render('relation/follower',{
                    user_relation:user.name,
                    relation_users:relation_users
                });
            })
        })
    })
});

router.get('/:url/following',function(req,res){
    User.findOne({url:req.params.url},function(err,user){
        Relation.find({following:user._id},function(err,relation){
            var relation_users = [];
            async.eachSeries(relation,function(relation_item,cb){
                User.findOne({_id:relation_item.follower},'name url signature avatar_url avatar_url_s', function(error, user_o) {
                    if(!user_o) return cb();
                    relation_users.push(user_o)
                    cb();
                });
            },function(err){
                res.render('relation/following',{
                    user_relation:user.name,
                    relation_users:relation_users
                });
            })
        })
    })
});

module.exports = router;
