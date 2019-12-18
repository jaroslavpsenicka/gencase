var mongoose = require('mongoose');

module.exports = mongoose.model('Case', {
	_id: 					{ type: mongoose.Schema.Types.ObjectId, required: true },
	id: 					{ type: String, required: true },
	aud:					{ type: String },
	name: 				{ type: String, required: true },
	revision: 		{ type: Number, required: true, default: 0 },
	data: 				{ type: Map, of: Object },
	model:				{ type: mongoose.Schema.Types.ObjectId, ref: 'Model', required: true },
	createdBy:		{ type: String },
	createdAt: 		{ type: Date },
	updatedBy:		{ type: String },
	updatedAt: 		{ type: Date },
  description: 	{ type: String },
	starred: 			{ type: Boolean, value: false },
	state:				{ type: String },
	transition:		{ type: String }
});