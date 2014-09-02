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

router.post('/uploadcarimg', function(req, res) {
    new formidable.IncomingForm().parse(req,function(err,fields,files){
        var img = files.img;
        if(!img.name) {
            res.json({r:0});
            return;
        }else{
            if(parseInt(img.size/1024)>5120){
                res.json({r:2});
                return;
            }
            var target_floder = process.cwd()+'/public/assets/carimg/'+req.session.user._id;
            if(!fs.existsSync(target_floder)){
                if(!fs.existsSync(process.cwd()+'/public/assets/carimg')){
                    fs.mkdirSync(process.cwd()+'/public/assets/carimg');
                }
                fs.mkdirSync(target_floder);
            }
            var save_url = '/assets/userbg/'+req.session.user._id+'/ubg'+req.session.user._id+path.extname(img.name);
            gm(img.path).resize(1040).crop(1040,400).write(process.cwd()+'/public'+save_url,function(){
                User.update({_id:req.session.user._id},{userbg_url:save_url},function(err){
                    if(!err){
                        req.session.user.userbg_url = save_url;
                        res.json({r:1,url:save_url});
                    }
                });
            })
        }
    });
});

module.exports = router;
