var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');

require('./models/user');
require('./models/topic');
