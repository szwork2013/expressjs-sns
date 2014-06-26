require( '../db' );

var express = require('express');
var router = express.Router();
var async = require('async');

var path = require( 'path' );
var gm = require( 'gm' );
var mongoose = require( 'mongoose' );
var User = mongoose.model('User');
var Topic = mongoose.model('Topic');
var Reply = mongoose.model('Reply');

var formidable = require('formidable');
var fs = require('fs');

function GetUserIndexByUser(req,res,user,callback){
    Topic.find({author_id:user._id},null,{sort:{create_date:-1}},function(err,topics){
        Reply.find({author_id:user._id},'content',{sort:{create_date:-1}},function(err,replys){
            callback(topics,replys);
        })
    })
}

function RendUserIndex(req,res,user,topics,replys){
    replys.forEach(function(reply){
        reply.set('content',reply.content.substr(0,10)+'...');
    });
    res.render('./user/index', { 
        title: user.name,
        user:req.session.user,
        showuser:user,
        topics:topics,
        replys:replys,
        isme:req.session.user.email===user.email?[1]:[]
    });
}

router.get('/settings', function(req, res) {
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

router.post('/saveimgsettings', function(req, res) {
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
            var target_url_l =  process.cwd()+'/public/uploads/'+req.session.user._id+'/u'+req.session.user._id+'_l'+path.extname(files.avatar.name);
            var target_url_s =  process.cwd()+'/public/uploads/'+req.session.user._id+'/u'+req.session.user._id+'_s'+path.extname(files.avatar.name);
            var save_url =  '/uploads/'+req.session.user._id+'/u'+req.session.user._id+path.extname(files.avatar.name);

            /*
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
               */

            async.parallel([
                function(callback){
                    gm(files.avatar.path).write(process.cwd()+'/public'+save_url,function(){
                        callback();
                    })
                },
                function(callback){
                    gm(files.avatar.path).resize(100,100,'!').write(target_url_l,function(){
                        callback();
                    })
                },
                function(callback){
                    gm(files.avatar.path).resize(48,48,'!').write(target_url_s,function(){
                        callback();    
                    })
                }
            ],function(){
                User.findOneAndUpdate({name:req.session.user.name},{avatar_url:save_url},function(err,user){
                    if(!err){
                        req.session.user.avatar_url = save_url;
                        res.redirect('/user/'+user.url);
                    }
                });
            });


            /*
            gm(files.avatar.path).resize(100,100,'!').write(target_url_l,function(){
                gm(files.avatar.path).resize(48,48,'!').write(target_url_s,function(){
                    User.findOneAndUpdate({name:req.session.user.name},{avatar_url:save_url},function(err,user){
                        if(!err){
                            req.session.user.avatar_url = save_url;
                            res.redirect('/user/'+user.url);
                        }
                    });
                })
            })
            */
        }
    });
});

router.post('/savebasesettings', function(req, res) {
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

router.post('/savepwdsettings', function(req, res) {
    var newpwd = req.body.newupwd,
    oldpwd = req.body.oldupwd;
User.findOneAndUpdate({name:req.session.user.name,pwd:oldpwd},{
    pwd:newpwd
},function(err,user){
    if(!user || err){
        res.redirect('/error')
    }else{
        req.session.user.pwd = newpwd; 
        res.redirect('/user/'+user._id);
    }
});
});

router.post('/registervalidate', function(req, res) {
    if(req.body.email){
        User.findOne({email:req.body.email},function(err,user){
            if(user){
                res.json({r:1});
            }else{
                res.json({r:0});
            }
        });
    }else{
        res.redirect('/error'); 
    }
});

router.post('/register', function(req, res) {
       new User({
           email:req.body.uemail,
           name:req.body.uname,
           pwd:req.body.upwd,
           phone:req.body.uphone
       }).save( function( err,user){
           if(err){
                res.redirect('/error');
            }else{
                User.findOneAndUpdate({_id:user._id},{url:user._id},function(){
                    res.redirect('/login');
                })
            }
        });
});

router.post('/login', function(req, res) {
    var username = req.body.username;
    var userpwd = req.body.userpwd;
    User.findOne({$or:[{ name:username}, {email:username}]},function(err,user){
        var error_msg = '';

        if(!user || userpwd != user.pwd){
            if(!user) {
                error_msg = '用户不存在';
            }else if(userpwd != user.pwd){
                error_msg = '密码错误';
            }
            res.render('error',{
                error:error_msg
            });
        }else{
            //登陆成功
            req.session.user = user;
            req.session.save();
            res.redirect('/');
        }
    });
});

router.get('/:url', function(req, res) {
    if(req.session.user){
        User.findOne({url:req.params.url},function(err,user){
            if(!user){
                res.redirect('/error');
            }else{
                GetUserIndexByUser(req,res,user,function(topics,replys){
                    RendUserIndex(req,res,user,topics,replys);
                });
            }
        });
    }else{
        res.render('user/login');
    }
});

module.exports = router;
