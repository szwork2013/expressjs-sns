var mongoose = require('mongoose');
var moment =  require('moment');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

//type:
//1.品牌
//2.单品
//3.大众讨论

var BoardSchema = new Schema({
    type:{type:Number,require:true,default:1},
    name: {type:String,required:true},
    url: {type:String,required:true},
    img_url: {type:String},
    desc:{type:String},
    topic_count:{type:Number,default:0},
    last_reply:{type: Date, default: Date.now},
    create_date: { type: Date, default: Date.now}
});

BoardSchema.virtual('create_date_format').get(function(){
    return moment(this.create_date).format('YYYY-MM-DD HH:mm');
});

BoardSchema.virtual('last_reply_fromnow').get(function(){
    return moment(this.last_reply).lang('zh-cn').fromNow();
});

BoardSchema.index({create_date:-1});
BoardSchema.index({last_reply:-1});

var BoardModel = mongoose.model('Board', BoardSchema);
