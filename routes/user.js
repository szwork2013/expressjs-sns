require( '../db' );

var express = require('express');
var router = express.Router();

var mongoose = require( 'mongoose' );
var UserModel = mongoose.model('User');
/* GET users listing. */

router.get('/', function(req, res) {
    UserModel.find(function(err,users,count){
        res.render('index', { 
            title: '',
            users:users
        });
    });
});

module.exports = router;
