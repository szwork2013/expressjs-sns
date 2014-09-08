var mongoose = require('mongoose');
var moment =  require('moment');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var CarSchema = new Schema({
    user_id:{type:ObjectId,require:true},
    brand:{type:String,require:true},
    name:{type:String,require:true},
    desc:{type:String},
    isown:{type:Boolean},
    engine:{type:Number},
    turbe:{type:Boolean},
    box:{type:String},
    drivetype:{type:String},
    speed:{type:Number},
    maxps:{type:Number},
    maxum:{type:Number},
    wheelsize:{type:Number},
    items:[{_id:false,itemtype:String,itemname:String}],
    imgs:[{_id:false,imgdesc:String,imgsrc:String}],
    create_date:{type: Date, default: Date.now},
    update_date:{type: Date, default: Date.now}
});

CarSchema.virtual('create_date_format').get(function(){
    return moment(this.create_date).format('YYYY-MM-DD HH:mm');
});

CarSchema.virtual('update_date_format').get(function(){
    return moment(this.update_date).lang('zh-cn').fromNow();
});

CarSchema.set('toObject',{
   virtuals: true
});

CarSchema.set('toJSON',{
   virtuals: true
});

var Car = mongoose.model('Car', CarSchema);
