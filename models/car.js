var mongoose = require('mongoose');
var moment =  require('moment');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var CarSchema = new Schema({
    brand:{type:String},
    name:{type:String},
    owner:{type:ObjectId},
    changeitem:[{_id:false,type:String,name:String}],
    buy_date:{type: Date}
});

CarSchema.virtual('buy_date_format').get(function(){
    return moment(this.buy_date).lang('zh-cn').fromNow();
});

var CarModel = mongoose.model('Car', CarSchema);
