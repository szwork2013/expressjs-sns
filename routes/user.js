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

var crypto = require('crypto');

router.post('/saveimgsettings', function(req, res) {
    new formidable.IncomingForm().parse(req,function(err,fields,files){

        if(!files.avatar.name) {
            res.redirect('/error');
        }else{
            /*
             *  check floder  
             */
            var target_floder = process.cwd()+'/public/assets/avatar/'+req.session.user._id;
            if(!fs.existsSync(target_floder)){
                if(!fs.existsSync(process.cwd()+'/public/assets/avatar')){
                    fs.mkdirSync(process.cwd()+'/public/assets/avatar');
                }
                fs.mkdirSync(target_floder);
            }
            /*
             *  upload avatar
             */
            var save_url_l = '/assets/avatar/'+req.session.user._id+'/u'+req.session.user._id+'_l'+path.extname(files.avatar.name);
            var save_url_s = '/assets/avatar/'+req.session.user._id+'/u'+req.session.user._id+'_s'+path.extname(files.avatar.name);
            var save_url = '/assets/avatar/'+req.session.user._id+'/u'+req.session.user._id+path.extname(files.avatar.name);
            async.parallel([
                function(callback){
                    gm(files.avatar.path).write(process.cwd()+'/public'+save_url,function(){
                        callback();
                    })
                },
                function(callback){
                    gm(files.avatar.path).resize(128,128,'!').write(process.cwd()+'/public'+save_url_l,function(){
                        callback();
                    })
                },
                function(callback){
                    gm(files.avatar.path).resize(48,48,'!').write(process.cwd()+'/public'+save_url_s,function(){
                        callback();    
                    })
                }
            ],function(){
                User.findOneAndUpdate({_id:req.session.user._id},{avatar_url:save_url},function(err,user){
                    if(!err){
                        req.session.user.avatar_url = save_url;
                        req.session.user.avatar_url_s = save_url_s;
                        req.session.user.avatar_url_l = save_url_l;
                        res.redirect('/'+user.url);
                    }
                });
            });
        }
    });
});

router.post('/savebasesettings', function(req, res) {
    var newname = req.body.uname,
    newemail = req.body.uemail,
    newurl = req.body.uurl;
    newsign = req.body.usign;
User.findOneAndUpdate({_id:req.session.user._id},{name:newname,email:newemail,url:newurl,signature:newsign},function(err,user){
    if(!err){
        req.session.user.name = newname; 
        req.session.user.email = newemail; 
        req.session.user.url = newurl;
        req.session.user.signature = newsign;
        res.redirect('/'+newurl);
    }
});
});

router.post('/savepwdsettings', function(req, res) {
    var newpwd = req.body.newupwd,
    oldpwd = req.body.oldupwd;
User.findOneAndUpdate({_id:req.session.user._id,pwd:oldpwd},{
},function(err,user){
    if(!user || err){
        res.redirect('/error')
    }else{
        req.session.user.pwd = newpwd;
        res.redirect('/'+user.url);
    }
});
});

router.post('/registervalidate', function(req, res) {
    if(req.body.email && req.body.name){
        User.findOne({email:req.body.email},function(err,user){
            if(user){
                res.json({r:1});
            }else{
                User.findOne({name:req.body.name},function(err,user){
                    if(user){
                        res.json({r:2});
                    }else{
                        res.json({r:0});
                    }
                })
            }
        });
    }
});

router.post('/validateurl', function(req, res) {
    if(req.session.user && req.body.url === req.session.user.url){
        res.json({r:0});
    }else if(req.body.url){
        User.findOne({url:req.body.url},function(err,user){
            if(user){
                res.json({r:1});
            }else{
                res.json({r:0});
            }
        });
    }
});

router.post('/register', function(req, res) {
       new User({
           email:req.body.uemail,
           name:req.body.uname,
           pwd:crypto.createHash('sha1').update(req.body.upwd).digest('hex'),
           phone:req.body.uphone
       }).save(function(err,user){
           if(err){
                res.redirect('/error');
            }else{
                User.findOneAndUpdate({_id:user._id},{url:user._id},function(err,user){
                    res.render('user/active',{
                        title:'激活账号',
                        link:crypto.createHash('sha1').update(user._id.toString()).digest('hex')
                    });
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
                message:error_msg
            });
        }else{
            req.session.user = user;
            if(req.body.rememberme){
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
            }
            //登陆成功
            res.redirect('/');
        }
    });
});

router.get('/:name/:idhash', function(req, res) {
    if(req.params.name){
        User.findOne({name:req.params.name},function(err,user){
            if(user){
                if(req.params.idhash === crypto.createHash('sha1').update(user._id.toString()).digest('hex')){
                  User.update({name:user.name},{actived:true},function(err,user){
                      if(user) res.redirect('/login');
                  })   
                }
            }
        })
    }
});

module.exports = router;
