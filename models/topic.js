var mongoose = require('mongoose');
var moment =  require('moment');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Topic = new Schema({
    title:{type:String,required:true},
    content:{type:String,required:true},
    author_id:{type:ObjectId},
    last_reply: { type:ObjectId},
    reply_count: { type: Number, default: 0 },
    visit_count: { type: Number, default: 0 },
    fav_count: { type: Number, default:0 },
    content_is_html: { type: Boolean },
    last_reply_date: { type: Date, default: Date.now },
    top: { type: Boolean, default: false },
    create_date: { type: Date, default: Date.now },
    update_date: { type: Date, default: Date.now }
});

Topic.virtual('create_date_format').get(function(){
    return moment(this.create_date).format('YYYY-MM-DD HH:mm');
});
Topic.virtual('update_date_format').get(function(){
    return moment(this.update_date).format('YYYY-MM-DD HH:mm');
});

var TopicModel = mongoose.model('Topic',Topic);
