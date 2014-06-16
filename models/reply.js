var mongoose = require('mongoose');
var moment =  require('moment');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Reply = new Schema({
	content: { type: String },
	topic_id: { type: ObjectId},
	reply_id : { type: ObjectId },
	author_id: { type: ObjectId },
	create_date: { type: Date, default: Date.now },
	update_date: { type: Date, default: Date.now },
	content_is_html: { type: Boolean },
    up:{ type: Number,default: 0},
    down:{ type: Number,default: 0}
});

Reply.virtual('create_date_format').get(function(){
    return moment(this.create_date).format('YYYY-MM-DD HH:mm');
});
Reply.virtual('update_date_format').get(function(){
    return moment(this.update_date).format('YYYY-MM-DD HH:mm');
});

mongoose.model('Reply', Reply);
