var express = require('express');
var router = express.Router();
var async =  require('async');

//data
var mongoose = require( 'mongoose' );
var User = mongoose.model('User');
var Relation = mongoose.model('Relation');

router.post('/:url/new',function(req,res){
    User.findOne({url:req.params.url},function(err,user){
        Relation.findOne({$and:[{user_id:req.session.user._id},{focus_user_id:user._id}]},function(err,relation){
            if(relation){
                    res.json({r:0});
            }else{
                new Relation({
                    user_id:req.session.user._id,
                    focus_user_id:user._id
                }).save(function(err,relation){
                    if(relation){
                        res.json({r:1}); 
                    }
                });
            }
        });
    });
});

module.exports = router;
