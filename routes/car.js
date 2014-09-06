var express = require('express');
var router = express.Router();
var crypto = require('crypto');
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
    if(!req.session.user){
        res.redirect('/login');
    }
    res.render('car/add',{
        title:'添加汽车'
    });
});

router.post('/add', function(req, res) {
    var query = {
        user:req.session.user._id,
        isown:req.body.isown === 'true'?true:false,
        brand:req.body.carbrand,
        name:req.body.carname,
        desc:req.body.cardesc
    }
    if(req.body.engine) query.engine = parseFloat(req.body.engine);
    if(req.body.turbo) query.turbo = req.body.turbo==='true'?true:false;
    if(req.body.boxtype) query.boxtype = req.body.boxtype;
    if(req.body.drivetype) query.drivetype = req.body.drivetype;
    if(req.body.speed) query.speed = parseFloat(req.body.speed);
    if(req.body.maxps) query.maxps = parseFloat(req.body.maxps);
    if(req.body.maxum) query.maxum = parseFloat(req.body.maxum);
    if(req.body.wheelsize) query.wheelsize = parseFloat(req.body.wheelsize);
    if(req.body.caritem) query.items  = req.body.caritem;

    new Car(query).save(function(err,car){
        if(!car || err){
            res.json({r:0})
        }else{
            res.json({r:1,car:car})
        }
    });
});

router.post('/uploadimg', function(req, res) {
    var form = new formidable.IncomingForm();
    files = [];

    form.on('file',function(field,file){
        files.push(file);
    });

    form.parse(req,function(err){
        if(!fs.existsSync(process.cwd()+'/public/assets/carimg')){
            fs.mkdirSync(process.cwd()+'/public/assets/carimg');
        }
        var urls = []
        async.eachSeries(files,function(file,cb){
            var url = '/assets/carimg/'+crypto.createHash('md5').update((new Date()).valueOf().toString()+crypto.randomBytes(10).toString('hex')).digest('hex')+path.extname(file.name);
            gm(file.path).write(process.cwd()+'/public'+url,function(){
                urls.push(url);
                cb();
            })
        },function(){
            res.json({r:1,urls:urls});
        });
    });
});

router.get('/:id',function(req,res){
    Car.findOne({_id:req.params.id},function(err,car){
        if(!car || err){
            res.redirect('/error');
            return;
        }
        res.render('car/index',{
            title:car.name+'('+car.brand+')',
            car:car
        });
    })
});

module.exports = router;
