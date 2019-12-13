var mongoose = require('mongoose');

module.exports = mongoose.model('Document', {
	_id: 					{ type: mongoose.Schema.Types.ObjectId, required: true },
	id: 					{ type: String, required: true },
	name: 				{ type: String, required: true },
	revision: 		{ type: Number, required: true },
	case:					{ type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
	createdBy:		{ type: String },
	createdAt: 		{ type: Date },
	updatedBy:		{ type: String },
	updatedAt: 		{ type: Date },
  description: 	{ type: String },
	size:	 				{ type: Number },
	contents: 		{ data: Buffer, contentType: String }
});