var mongoose = require('mongoose');

module.exports = mongoose.model('Model', {
	_id: 								{ type: mongoose.Schema.Types.ObjectId, required: true },
	id: 								{ type: String, required: true },
	name: 							{ type: String, required: true },
	revision: 					{ type: Number, required: true },
	spec: 							{ type: Object, required: true },
	createdBy:					{ type: String },
	createdAt: 					{ type: Date },
	updatedBy:					{ type: String },
	updatedAt: 					{ type: Date },
  description: 				{ type: String },
	starred: 						{ type: Boolean, value: false }
});