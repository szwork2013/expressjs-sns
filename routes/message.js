require( '../db' );

var express = require('express');
var router = express.Router();
var async =  require('async');

//data
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Topic = mongoose.model('Topic');
var Reply = mongoose.model('Reply');

//添加message页面
router.get('/new', function(req, res) {
    if(!req.session.user){
        res.redirect('/login');
    }else{
        res.render('message/new', { 
            title: '新话题'
        });
    }
});

module.exports = router;
