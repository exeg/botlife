const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const itemSchema = new mongoose.Schema({
  type: { 
  	type: String,
  	default: "button"
  },	
  level: { type: Number },
  text: { type: String },
  master: {
    type: mongoose.Schema.ObjectId,
    ref: 'Item',
    default: null
  }
});

module.exports = mongoose.model('Item', itemSchema);
