var mongoose = require('mongoose');

module.exports = mongoose.model('Notification', {
	_id: 					{ type: mongoose.Schema.Types.ObjectId, required: true },
	id: 					{ type: String, required: true },
	aud:					{ type: String },
	title: 				{ type: String, required: true },
	subtitle: 		{ type: String },
	model:				{ type: String },
	case:					{ type: String },
	createdBy:		{ type: String },
	createdAt: 		{ type: Date },
	updatedBy:		{ type: String },
	updatedAt: 		{ type: Date },
	seen:	 				{ type: Boolean, default: false }
});