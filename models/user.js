var mongoose = require('mongoose');
var moment =  require('moment');

var User = new mongoose.Schema({

    name : {type:String,required:true},
    url : {type:String},
    email : {type:String,required:true},
    pwd : {type:String,required:true},
    phone:{type:String,required:true},

    img_url:String,
    signature : String,
    actived:Boolean,

    score:{type:Number,default:0},
    level:{type:Number,default:1},

    topic_count:{type:Number,default:0},
    reply_count:{type:Number,default:0},

    follower_count:{type:Number,default:0},
    following_count:{type:Number,default:0},

    create_date: { type: Date, default: Date.now },
    update_date: { type: Date, default: Date.now },

    avatar_url: { type: String,default: '/img/1.jpg'}

});

User.virtual('create_date_format').get(function(){
    return moment(this.create_date).format('YYYY-MM-DD HH:mm');
});
User.virtual('update_date_format').get(function(){
    return moment(this.update_date).format('YYYY-MM-DD HH:mm');
});

var UserModel = mongoose.model('User',User);
