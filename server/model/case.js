var mongoose = require('mongoose');

module.exports = mongoose.model('Case', {
	_id: 					{ type: mongoose.Schema.Types.ObjectId, required: true },
	id: 					{ type: String, required: true },
	name: 				{ type: String, required: true },
	revision: 		{ type: Number, required: true },
	data: 				{ type: Map, of: String },
	model:				{ type: mongoose.Schema.Types.ObjectId, ref: 'Model', required: true },
	createdBy:		{ type: String },
	createdAt: 		{ type: Date },
	updatedBy:		{ type: String },
	updatedAt: 		{ type: Date },
  description: 	{ type: String },
	starred: 			{ type: Boolean, value: false }
});