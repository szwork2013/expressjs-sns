var mongoose = require('mongoose');
var moment =  require('moment');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

//type:
//1.品牌
//2.单品

var BoardSchema = new Schema({
    type:{type:Number,require:true,default:1},
    name: {type:String,required:true},
    url: {type:String,required:true},
    img_url: {type:String},
    desc:{type:String},
    topic_count:{type:Number,default:0},
    create_date: { type: Date, default: Date.now }
});

BoardSchema.virtual('create_date_format').get(function(){
    return moment(this.create_date).format('YYYY-MM-DD HH:mm');
});

var BoardModel = mongoose.model('Board', BoardSchema);
