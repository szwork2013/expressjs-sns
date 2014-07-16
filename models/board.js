var mongoose = require('mongoose');
var moment =  require('moment');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var BoardSchema = new Schema({
    name: {type:String,required:true},
    url: {type:String,required:true},
    desc:{type:String},
    topic_count:{type:Number,default:0},
    parent_id:{type:ObjectId},
    create_date: { type: Date, default: Date.now }
});

BoardSchema.virtual('create_date_format').get(function(){
    return moment(this.create_date).format('YYYY-MM-DD HH:mm');
});

var BoardModel = mongoose.model('Board', BoardSchema);
