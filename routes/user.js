var express = require('express');
var router = express.Router();
var async = require('async');
var nodemailer = require("nodemailer");

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
            var avatarname = crypto.randomBytes(10).toString('hex');
            var save_url_l = '/assets/avatar/'+req.session.user._id+'/'+avatarname+'_l'+path.extname(files.avatar.name);
            var save_url_s = '/assets/avatar/'+req.session.user._id+'/'+avatarname+'_s'+path.extname(files.avatar.name);
            var save_url = '/assets/avatar/'+req.session.user._id+'/'+avatarname+path.extname(files.avatar.name);
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
                                res.json({r:1,avatar_url_s:save_url_s});
                            }
                        });
                    });
        }
    });
});

router.post('/uploaduserbg', function(req, res) {
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
            var target_floder = process.cwd()+'/public/assets/userbg/'+req.session.user._id;
            if(!fs.existsSync(target_floder)){
                if(!fs.existsSync(process.cwd()+'/public/assets/userbg')){
                    fs.mkdirSync(process.cwd()+'/public/assets/userbg');
                }
                fs.mkdirSync(target_floder);
            }
            var save_url = '/assets/userbg/'+req.session.user._id+'/ubg'+crypto.randomBytes(10).toString('hex')+path.extname(img.name);
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

router.post('/savebasesettings', function(req, res) {
    var newname = req.body.uname,
    newurl = req.body.uurl,
    newdesc = req.body.udesc,
    newsign = req.body.usign;
User.findOneAndUpdate({_id:req.session.user._id},{name:newname,url:newurl,signature:newsign,desc:newdesc},function(err,user){
    if(!err){
        req.session.user.name = newname;
        req.session.user.url = newurl;
        req.session.user.signature = newsign;
        req.session.user.desc = newdesc;
        res.json({r:1});
    }
});
});

router.post('/savepwdsettings', function(req, res) {
    var newpwd = crypto.createHash('sha1').update(req.body.newupwd).digest('hex'),
    oldpwd = crypto.createHash('sha1').update(req.body.oldupwd).digest('hex');
User.findOneAndUpdate({_id:req.session.user._id,pwd:oldpwd},{pwd:newpwd},function(err,user){
    if(err){
        res.json({r:0})
    }else if(!user){
        res.json({r:2})
    }else{
        req.session.user.pwd = newpwd;
        res.json({r:1})
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

router.post('/validatebase', function(req, res) {
    var resultjson = {};
    async.parallel([
        function(cb){
            if(req.body.name && req.body.name != req.session.user.name){
                User.findOne({name:req.body.name},function(err,username){
                    if(username) resultjson.un = true;
                    cb();
                })
            }else{
                cb();
            }
        },
        function(cb){
            if(req.body.url && req.body.url != req.session.user.url){
                User.findOne({url:req.body.url},function(err,userurl){
                    if(userurl) resultjson.uu =  true;
                    cb();
                })
            }else{
                cb();
            }

        }
    ],function(){
        if(resultjson.un){
            res.json({r:1})
        }else if(resultjson.uu){
            res.json({r:2});
        }else{
            res.json({r:0});
        }
    })
});

var smtpTransport = nodemailer.createTransport('SMTP',{
    host:'mail.privateemail.com',
    auth: {
        user: 'admin@autocomer.com',
        pass: 'sp19881009'
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
                var linkstr=crypto.createHash('sha1').update(user._id.toString()).digest('hex');
                //send email
                var html ='<h5>亲爱的'+user.name+',恭喜你，注册账号成功！请点击以下链接激活您的账号：</h5><p><a href="http://dev:8080/user/'+user._id+'/'+linkstr+'">点此链接激活账号!</a></p><p>(这是一封自动产生的email，请勿回复。)</p>';
                smtpTransport.sendMail({
                    from:'admin@autocomer.com',
                    to: user.email,
                    subject: "欢迎"+user.name+"来到来者,请激活您的账号",
                    html: html,
                }, function(err,response){
                    if(err){
                        res.redirect('/error');
                    }else{
                        res.render('user/active',{
                            title:'激活账号',
                            link:linkstr,
                            isregister:true,
                            uemail:user.email
                        });
                    }
                });
            })
        }
    });
});

router.post('/login', function(req, res) {
    var username = req.body.username;
    var userpwd = crypto.createHash('sha1').update(req.body.userpwd).digest('hex');
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
        }else if(!user.actived){
            res.render('user/active',{
                title:'激活账号',
                link:crypto.createHash('sha1').update(user._id.toString()).digest('hex'),
                isregister:false,
                uemail:user.email
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

router.get('/:id/:idhash', function(req, res) {
    if(req.params.id){
        User.findOne({_id:req.params.id},function(err,user){
            if(user){
                if(req.params.idhash === crypto.createHash('sha1').update(user._id.toString()).digest('hex')){
                    User.update({name:user.name},{actived:true},function(err,user){
                        if(user) res.render('user/actived');
                    })
                }
            }
        })
    }
});

module.exports = router;
