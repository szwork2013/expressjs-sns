var mongoose = require('mongoose');
var moment =  require('moment');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var RelationSchema = new Schema({
    from_id: { type: ObjectId },
    to_id:{ type: ObjectId },
    create_date: { type: Date, default: Date.now }
});

RelationSchema.virtual('create_date_format').get(function(){
    return moment(this.create_date).format('YYYY-MM-DD HH:mm');
});

var Relation = mongoose.model('Relation', RelationSchema);
