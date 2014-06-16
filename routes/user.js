require( '../db' );

var express = require('express');
var router = express.Router();

var mongoose = require( 'mongoose' );
var User = mongoose.model('User');
var Topic = mongoose.model('Topic');
var Reply = mongoose.model('Reply');

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
        User.findOne({_id:req.params._id},function(err,user){
            Topic.find({author_id:req.params._id},null,{sort:{create_date:-1}},function(err,topics){
                Reply.find({author_id:req.params._id},'content',{sort:{create_date:-1}},function(err,replys){
                    replys.forEach(function(reply){
                            reply.set('content',reply.content.substr(0,3)+'...');
                    });

                    res.render('./user/index', { 
                        title: user.name,
                        user:req.session.user,
                        showuser:user,
                        topics:topics,
                        replys:replys
                    });
                })
            })
        });
    }else{
        res.redirect('/login');
    }
});

router.get('/:_id/settings', function(req, res) {
    if(req.session.user){
        User.findOne({_id:req.session.user._id},function(err,user){
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
                User.findOneAndUpdate({name:req.session.user.name},{avatar_url:save_url},function(err,user){
                    if(!err){
                        req.session.user.avatar_url = save_url; 
                        res.redirect('/user/'+user._id);
                    }
                });
            });
        });

        //name


    });
});

module.exports = router;
