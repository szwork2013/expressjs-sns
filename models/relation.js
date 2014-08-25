var mongoose = require('mongoose');
var moment =  require('moment');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var RelationSchema = new Schema({
    following: { type: ObjectId },
    follower:{ type: ObjectId },
    car_id:{ type: ObjectId },
    model_id:{ type: ObjectId },
    create_date: { type: Date, default: Date.now }
});

RelationSchema.virtual('create_date_format').get(function(){
    return moment(this.create_date).format('YYYY-MM-DD HH:mm');
});

RelationSchema.virtual('create_date_fromnow').get(function(){
    return moment(this.create_date).lang('zh-cn').fromNow();
});

RelationSchema.set('toObject',{
   virtuals: true
});

RelationSchema.set('toJSON',{
   virtuals: true
});

var Relation = mongoose.model('Relation', RelationSchema);
