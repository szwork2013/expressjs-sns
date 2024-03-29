var mongoose = require('mongoose');
var moment =  require('moment');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var MessageSchema = new Schema({
    from_id: { type: ObjectId },
    to_id:{ type: ObjectId },
    content: { type: String },
    has_read: { type: Boolean,default:false },
    create_date: { type: Date, default: Date.now }
});

MessageSchema.virtual('create_date_format').get(function(){
    return moment(this.create_date).format('YYYY-MM-DD HH:mm');
});

MessageSchema.virtual('create_date_fromnow').get(function(){
    return moment(this.create_date).lang('zh-cn').fromNow();
});

MessageSchema.set('toObject',{
   virtuals: true
});

MessageSchema.set('toJSON',{
   virtuals: true
});

var MessageModel = mongoose.model('Message', MessageSchema);
