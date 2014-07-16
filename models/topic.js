var mongoose = require('mongoose');
var moment =  require('moment');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Topic = new Schema({
    title:{type:String,required:true},
    content:{type:String,required:true},
    board_id:{type:ObjectId},
    author_id:{type:ObjectId},
    last_reply: { type:ObjectId},
    reply_count: { type: Number, default: 0 },
    visit_count: { type: Number, default: 0 },
    collect_count: { type: Number, default:0 },
    top: { type: Boolean, default: false },
    create_date: { type: Date, default: Date.now },
    update_date: { type: Date, default: Date.now },
    last_reply_date: { type: Date, default: Date.now }
});

Topic.virtual('create_date_format').get(function(){
    return moment(this.create_date).format('YYYY-MM-DD HH:mm');
});
Topic.virtual('update_date_format').get(function(){
    return moment(this.update_date).format('YYYY-MM-DD HH:mm');
});
Topic.virtual('last_reply_date_format').get(function(){
    return moment(this.last_reply_date).lang('zh-cn').fromNow();
});

Topic.index({create_date:-1});
Topic.index({top: -1, last_reply_date: -1});
Topic.index({last_reply_date:-1});

var TopicModel = mongoose.model('Topic',Topic);
