require( '../db' );

var express = require('express');
var router = express.Router();

//data
var mongoose = require( 'mongoose' );
var User = mongoose.model('User');

var formidable = require('formidable');

router.get('/new', function(req, res) {
    res.render('topic/new', { 
        title: '新话题'
    });
});

module.exports = router;
