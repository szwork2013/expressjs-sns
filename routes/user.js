require( '../db' );

var express = require('express');
var router = express.Router();

var mongoose = require( 'mongoose' );
var User = mongoose.model('User');


var formidable = require('formidable');
var fs = require('fs');

/*
router.get('/', function(req, res) {
    User.find(function(err,users,count){
        res.render('index', { 
            users:users
        });
    });
});
*/

router.get('/:_id', function(req, res) {
    if(req.session.user){
        User.findOne({name:req.session.user.name},function(err,user){
            res.render('./user/index', { 
                title: '账户信息',
                user:user
            });
        });
    }else{
        res.redirect('/error');
    }

});

router.get('/:_id/settings', function(req, res) {
    if(req.session.user){
        User.findOne({name:req.session.user.name},function(err,user){
            res.render('./user/settings', { 
                title: '账户设置',
                user:user
            });
        });
    }else{
        res.redirect('/error');
    }
});

router.post('/:_id/save-settings', function(req, res) {
    new formidable.IncomingForm().parse(req,function(err,fields,files){

        /*
         *  check floder  
         */
        var target_floder = process.cwd()+'/public/uploads/'+req.session.user.name;
        if(!fs.existsSync(target_floder)){
            fs.mkdirSync(target_floder);
        }
        /*
         *  upload avatar
         */
        var target_url =  process.cwd()+'/public/uploads/'+req.session.user.name+'/'+files.avatar.name;
        var save_url =  '/uploads/'+req.session.user.name+'/'+files.avatar.name;
        fs.rename(files.avatar.path,target_url,function(err){
            if(err) res.redirect('/error');
            fs.unlink(files.avatar.path, function() {
                req.session.user.avatar_url = save_url; 
                User.findOneAndUpdate({name:req.session.user.name},{avatar_url:save_url},function(err,user){
                    if(!err) 
                    res.redirect('/user/'+user._id);
                });
            });

        });

        //name




    });
});

module.exports = router;
