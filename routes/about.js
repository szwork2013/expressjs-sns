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
    if(!req.session.user){
        res.redirect('/login');
    }
    res.render('about/suggest', { title: '意见反馈' });
});

router.get('/disclaimer', function(req, res) {
    res.render('about/disclaimer', { title: '免责声明' });
});


var transporter = nodemailer.createTransport('SMTP',{
    host:'mail.privateemail.com',
    auth: {
        user: 'admin@autocomer.com',
        pass: 'sp19881009'
    }
});

router.post('/postsuggest', function(req, res,next) {
    transporter.sendMail({
        from:'admin@autocomer.com',
        to: 'spirityy109@gmail.com',
        subject: "注册用户:" + req.session.user.email,
        text: req.body.uname+'(邮箱:'+req.body.uemail+')'+'说:'+req.body.suggestcontent
    }, function(err, response){
        if(err){
            res.redirect('/error');
        }else{
            res.redirect('/');
        }
    });
})

module.exports = router;
