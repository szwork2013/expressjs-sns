var mongoose = require('mongoose');
var moment =  require('moment');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ChannelSchema = new Schema({
    name: {type:String,required:true},
    url: {type:String,required:true},
    desc:{type:String},
    parent_id:{type:ObjectId},
    create_date: { type: Date, default: Date.now }
});

ChannelSchema.virtual('create_date_format').get(function(){
    return moment(this.create_date).format('YYYY-MM-DD HH:mm');
});

var ChannelModel = mongoose.model('Channel', ChannelSchema);
