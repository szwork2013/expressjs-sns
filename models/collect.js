var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment =  require('moment');
var ObjectId = Schema.ObjectId;

var CollectSchema = new Schema({
    user_id: { type: ObjectId },
    topic_id: { type: ObjectId },
    create_date: { type: Date, default: Date.now }
});

CollectSchema.virtual('create_date_format').get(function(){
    return moment(this.create_date).format('YYYY-MM-DD HH:mm');
});

CollectSchema.virtual('create_date_fromnow').get(function(){
    return moment(this.create_date).lang('zh-cn').fromNow();
});

CollectSchema.set('toObject',{
   virtuals: true
});

CollectSchema.set('toJSON',{
   virtuals: true
});

var Collect = mongoose.model('Collect', CollectSchema);
