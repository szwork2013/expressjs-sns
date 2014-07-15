require( '../db' );

var express = require('express');
var router = express.Router();
var async =  require('async');

//data
var mongoose = require( 'mongoose' );
var User = mongoose.model('User');
var Relation = mongoose.model('Relation');

router.post('/:url/new',function(){
    


});

module.exports = router;
