var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var FavSchema = new Schema({
    user_id: { type: ObjectId },
    topic_id: { type: ObjectId },
    create_date: { type: Date, default: Date.now }
});

FavSchema.virtual('create_date_format').get(function(){
    return moment(this.create_date).format('YYYY-MM-DD HH:mm');
});

var FavModel = mongoose.model('Fav', FavSchema);
