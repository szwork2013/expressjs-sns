require( '../db' );

var express = require('express');
var router = express.Router();

var path = require( 'path' );
var mongoose = require( 'mongoose' );
var User = mongoose.model('User');
var Topic = mongoose.model('Topic');
var Reply = mongoose.model('Reply');

var formidable = require('formidable');
var fs = require('fs');



function GetUserIndexByUser(req,res,user){

        Topic.find({author_id:user._id},null,{sort:{create_date:-1}},function(err,topics){
            Reply.find({author_id:user._id},'content',{sort:{create_date:-1}},function(err,replys){
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
}


router.get('/:url', function(req, res) {
    if(req.session.user){
        User.findOne({url:req.params.url},function(err,user){
            if(!user){
                User.findOne({_id:req.params.url},function(err,user){
                    if(!user){
                        res.redirect('/error');
                    }else{
                        GetUserIndexByUser(req,res,user);
                    }
                });
            }else{
                    GetUserIndexByUser(req,res,user);
            }
        });
    }else{
        res.redirect('/login');
    }
});

router.get('/:url/settings', function(req, res) {
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

router.post('/:url/saveimgsettings', function(req, res) {
    new formidable.IncomingForm().parse(req,function(err,fields,files){

        if(!files.avatar.name) {
            res.redirect('/error');
        }else{
            /*
             *  check floder  
             */
            var target_floder = process.cwd()+'/public/uploads/'+req.session.user._id;
            if(!fs.existsSync(target_floder)){
                fs.mkdirSync(target_floder);
            }
            /*
             *  upload avatar
             */
            var target_url =  process.cwd()+'/public/uploads/'+req.session.user._id+'/u_'+req.session.user._id+path.extname(files.avatar.name);
            var save_url =  '/uploads/'+req.session.user._id+'/u_'+req.session.user._id+path.extname(files.avatar.name);
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
        }
    });
});

router.post('/:url/savebasesettings', function(req, res) {
        var newname = req.body.uname,
            newemail = req.body.uemail,
            newurl = req.body.uurl;
        User.findOneAndUpdate({name:req.session.user.name},{name:newname,email:newemail,url:newurl},function(err,user){
            if(!err){
                req.session.user.name = newname; 
                req.session.user.email = newemail; 
                req.session.user.url = newurl; 
                res.redirect('/user/'+newurl);
            }
        });
});

router.post('/:url/savepwdsettings', function(req, res) {
        var newpwd = req.body.newupwd;
        User.findOneAndUpdate({name:req.session.user.name},{
                pwd:newpwd 
        },function(err,user){
            if(!err){
                req.session.user.pwd = newpwd; 
                res.redirect('/user/'+user._id);
            }
        });
});

module.exports = router;
