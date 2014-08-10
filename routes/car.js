var express = require('express');
var router = express.Router();
var async =  require('async');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Topic = mongoose.model('Topic');
var Board = mongoose.model('Board');
var Reply = mongoose.model('Reply');
var Car = mongoose.model('Car');

var formidable = require('formidable');
var gm = require( 'gm' );
var path = require( 'path' );
var fs = require( 'fs' );
var moment =  require('moment');

router.get('/add',function(req,res){
    res.render('car/add',{
        title:'添加新车' 
    });
});

router.post('/add', function(req, res){
    new Car({
        brand:req.body.carbrand,
        type:req.body.cartype, 
        name:req.body.carname,
        desc:req.body.cardesc,
        owner:req.session.user._id
    }).save(function(err,car){
        if(!err){
            res.redirect('/car/'+car.name); 
        }
    });
});

router.get('/:name',function(req,res){
    Car.findOne({name:req.params.name},function(err,car){
       res.render('car/index',{
           title:car.name,
           car:car
       });
    })
});

module.exports = router;
