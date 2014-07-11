var mongoose = require('mongoose');
var moment =  require('moment');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var User = new mongoose.Schema({

    name : {type:String,required:true},
    url : {type:String},
    email : {type:String,required:true},
    pwd : {type:String,required:true},
    phone:{type:String,required:true},

    signature : String,
    desc : String,
    actived:Boolean,

    score:{type:Number,default:0},

    follower:[{_id:false,user_id:ObjectId}],
    following:[{_id:false,user_id:ObjectId}],

    create_date: { type: Date, default: Date.now },
    update_date: { type: Date, default: Date.now },

    isvip:{type:Boolean,default:false},
    avatar_url: { type: String,default: '/img/avatar_default.jpg'}

});

User.virtual('create_date_format').get(function(){
    return moment(this.create_date).format('YYYY-MM-DD HH:mm');
});

User.virtual('update_date_format').get(function(){
    return moment(this.update_date).lang('zh-cn').fromNow();
});

User.virtual('avatar_url_s').get(function(){
    var str = this.avatar_url;
    return [str.slice(0,str.lastIndexOf('.')),"_s",str.slice(str.lastIndexOf('.'))].join("");
});

User.virtual('avatar_url_l').get(function(){
    var str = this.avatar_url;
    return [str.slice(0,str.lastIndexOf('.')),"_l",str.slice(str.lastIndexOf('.'))].join("");
});

User.index({email: 1}, {unique: true});

var UserModel = mongoose.model('User',User);
