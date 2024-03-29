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
    top: {type: Boolean, default:false},
    reply_count: { type: Number, default: 0 },
    visit_count: { type: Number, default: 0 },
    collect_count: { type: Number, default:0 },
    liker:[{_id:false,liker_id:ObjectId}],
    reporter:[{_id:false,reporter_id:ObjectId}],
    create_date: { type: Date, default: Date.now },
    update_date: { type: Date, default: Date.now },
    last_reply_date: { type: Date, default: Date.now }
});

Topic.virtual('create_date_format').get(function(){
    return moment(this.create_date).format('YYYY-MM-DD HH:mm');
});

Topic.virtual('create_date_fromnow').get(function(){
    return moment(this.create_date).lang('zh-cn').fromNow();
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
Topic.index({reply_count:-1});
Topic.index({visit_count:-1});

Topic.set('toObject',{
   virtuals: true
});

Topic.set('toJSON',{
   virtuals: true
});

var TopicModel = mongoose.model('Topic',Topic);
