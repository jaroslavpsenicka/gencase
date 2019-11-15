var mongoose = require('mongoose');

module.exports = mongoose.model('Comment', {
	_id: 					{ type: mongoose.Schema.Types.ObjectId, required: true },
	id: 					{ type: String, required: true },
	case:					{ type: mongoose.Schema.Types.ObjectId, ref: 'Model', required: true },
	title: 				{ type: String },
	createdBy:		{ type: String },
	createdAt: 		{ type: Date },
	updatedBy:		{ type: String },
	updatedAt: 		{ type: Date },
	text:		 			{ type: String }
});