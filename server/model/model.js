var mongoose = require('mongoose');

module.exports = mongoose.model('Model', {
	_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	name: { 
		type: String,
		required: true
	},
  author: {
		type: String,
		required: true
	},
  revision: {
		type: Number,
		required: true
	},
  description: { 
		type: String
	},
	starred: {
    type: Boolean,
    value: false
	}
});