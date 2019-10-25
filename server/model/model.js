var mongoose = require('mongoose');

module.exports = mongoose.model('Model', {
	_id: 					{ type: mongoose.Schema.Types.ObjectId, required: true },
	id: 					{ type: String, required: true },
	name: 				{ type: String, required: true },
	author: 			{ type: String, required: true },
	createdAt: 		{ type: Date },
	updatedAt: 		{ type: Date },
  revision: 		{ type: Number, required: true },
  description: 	{ type: String },
	starred: 			{ type: Boolean, value: false }
});