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
        title:'添加汽车'
    });
});

router.get('/:url',function(req,res){
    Car.findOne({url:req.params.url},function(err,car){
        if(!car || err){
            res.redirect('/error');
            return;
        }
        res.render('car/index',{
            title:car.type+'('+car.brand+')',
            car:car
        });
    })
});

router.post('/add', function(req, res) {
    var form = new formidable.IncomingForm(),
    files = [];

    form.on('file',function(field,file){
        files.push(file);
    });

    form.parse(req,function(err,fields){
        console.info(fields);
        console.info(files);

        /*
        new Car({
            brand:fields.carbrand,
            type:fields.cartype,
            url:fields.carurl,
            desc:fields.cardesc
        }).save(function(err,car){
            if(!err){
                console.info(car);
                res.json({r:1,car:car})
                //res.redirect('/car/'+car.name);
            }
        });
        */
    });
});

module.exports = router;
