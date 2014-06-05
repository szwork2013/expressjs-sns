var mongoose = require('mongoose');

var Topic = new mongoose.Schema({
    title:String,
    content:String,
    author_id:ObjectId,
    top: { type: Boolean, default: false },
    reply_count: { type: Number, default: 0 },
    visit_count: { type: Number, default: 0 },
    fav_count: { type: Number, default: 0 },
    last_reply: { type: ObjectId },
    content_is_html: { type: Boolean },
    last_reply_at: { type: Date, default: Date.now },
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now }
});

var TopicModel = mongoose.model('Topic',Topic);
