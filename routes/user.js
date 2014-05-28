require( '../db' );

var express = require('express');
var router = express.Router();

var mongoose = require( 'mongoose' );
var User = mongoose.model('User');

router.get('/', function(req, res) {
    User.find(function(err,users,count){
        res.render('index', { 
            users:users
        });
    });
});

router.get('/:name', function(req, res) {
    res.render('settings', { title: '账户设置' });
});

module.exports = router;
