const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const fclientSchema = new mongoose.Schema({
  fid: { type: String },
  first_name: { type: String },
  last_name: { type: String },
  timezone: { type: Number },
  botsys: { type: String },
  votes: [{
    article: { type: String },
    result: { type: Number } 
	}],
  askHelp: {
  	type: Number,
  	default: 0
  }
});

module.exports = mongoose.model('Fclient', fclientSchema);
