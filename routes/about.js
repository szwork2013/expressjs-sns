var express = require('express');
var nodemailer = require("nodemailer");
var router = express.Router();

router.get('/', function(req, res) {
    res.render('about/index', { title: '关于我们' });
});

router.get('/contact', function(req, res) {
    res.render('about/contact', { title: '联系我们' });
});

router.get('/suggest', function(req, res) {
    res.render('about/suggest', { title: '意见反馈' });
});

router.get('/disclaimer', function(req, res) {
    res.render('about/disclaimer', { title: '免责声明' });
});

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "spirityy109@gmail.com",
        pass: "xxx"
    }
});

router.post('/postsuggest', function(req, res,next) {
    var uemail=req.session.user?req.session.user.email:req.body.uemail;
    smtpTransport.sendMail({
        to: 'spirityy109@gmail.com',
        subject: "Suggest by" + uemail,
        text: req.body.uname+':'+req.body.suggestcontent
    }, function(err, response){
        if(err){
            res.redirect('/error');
        }else{
            res.redirect('/');
        }
    });
})

module.exports = router;
