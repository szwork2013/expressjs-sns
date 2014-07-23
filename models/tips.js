var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

/*
 * type
 * 1.帖子回复
 * 2.留言回复
 * 3.私信
 * 4.关注
 */
var TipSchema = new Schema({
    type:{ type: String },
    user_id: { type: ObjectId },
    topic_id: { type: ObjectId },
    reply_id: { type: ObjectId },
    message_id:{ type: ObjectId },
    has_read: { type: Boolean,default:false },
    create_date: { type: Date, default: Date.now }
});

TipSchema.virtual('create_date_format').get(function(){
    return moment(this.create_date).format('YYYY-MM-DD HH:mm');
});

TipSchema.virtual('create_date_fromnow').get(function(){
    return moment(this.create_date).lang('zh-cn').fromNow();
});

var TipModel = mongoose.model('Tip', TipSchema);
