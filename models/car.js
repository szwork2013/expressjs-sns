var mongoose = require('mongoose');
var moment =  require('moment');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var CarSchema = new Schema({
    brand:{type:String,require:true},
    type:{type:String,require:true},
    name:{type:String},
    desc:{type:String},
    owner:{type:ObjectId},
    changeitem:[{_id:false,type:String,name:String}],
    create_date:{type: Date, default: Date.now},
    update_date:{type: Date, default: Date.now}
});

CarSchema.virtual('create_date_format').get(function(){
    return moment(this.create_date).format('YYYY-MM-DD HH:mm');
});

CarSchema.virtual('update_date_format').get(function(){
    return moment(this.update_date).lang('zh-cn').fromNow();
});

var CarModel = mongoose.model('Car', CarSchema);
