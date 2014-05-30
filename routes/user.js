require( '../db' );

var express = require('express');
var router = express.Router();

var mongoose = require( 'mongoose' );
var User = mongoose.model('User');


var formidable = require('formidable');
var fs = require('fs');

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

router.post('/:name/save-settings', function(req, res) {
    new formidable.IncomingForm().parse(req,function(err,fields,files){

        /*
         *  check floder  
         */
        var target_floder = './public/uploads/'+req.session.user.name;
        if(!fs.existsSync(target_floder)){
            fs.mkdirSync(target_floder);
        }
        /*
         *  upload avatar
         */
        var target_url = './public/uploads/'+req.session.user.name+'/'+files.avatar.name;
        var save_url = '../uploads/'+req.session.user.name+'/'+files.avatar.name;
        fs.rename(files.avatar.path,target_url,function(err){
            if(err) res.redirect('/error');
            fs.unlink(files.avatar.path, function() {
                if (!err) res.redirect('back');
            });

            req.session.user.avatar = save_url; 
            User.findOneAndUpdate({name:req.session.user.name},{avatar:save_url},function(err){
                if(err) res.redirect('/error');
                res.redirect('/');
            });
        });
    });
});

module.exports = router;
