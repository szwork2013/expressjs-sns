var mongoose = require('mongoose');
var moment =  require('moment');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var CarSchema = new Schema({
    brand:{type:String},
    name:{type:String},
    owner:{type:ObjectId},
    changeitem:[{_id:false,type:String,name:String}],
    create_date:{type: Date, default: Date.now}
});

CarSchema.virtual('create_date_format').get(function(){
    return moment(this.create_date).format('YYYY-MM-DD HH:mm');
});

var CarModel = mongoose.model('Car', BoardSchema);
