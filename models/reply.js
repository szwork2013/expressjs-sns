var mongoose = require('mongoose');
var moment =  require('moment');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Reply = new Schema({
	content: { type: String },
	topic_id: { type: ObjectId},
	board_id: { type: ObjectId},
	reply_id : { type: ObjectId },
	author_id: { type: ObjectId },
	create_date: { type: Date, default: Date.now },
    up:{ type: Number,default: 0},
    uper:[{_id:false,uper_id:ObjectId}]
});

Reply.virtual('create_date_format').get(function(){
    return moment(this.create_date).lang('zh-cn').fromNow();
});

Reply.set('toObject',{
   virtuals: true
});

Reply.set('toJSON',{
   virtuals: true
});

mongoose.model('Reply', Reply);
