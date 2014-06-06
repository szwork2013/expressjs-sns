var mongoose = require('mongoose');

var User = new mongoose.Schema({

    name : {type:String,required:true},
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

    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },

    avatar_url: { type: String}

});

var UserModel = mongoose.model('User',User);
