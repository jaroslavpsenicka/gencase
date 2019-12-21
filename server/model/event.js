const mongoose = require('mongoose');

const eventClasses = [
  'ACTION'
];

const eventTypes = [
  'ACTION_STARTED', 
  'ACTION_CANCELLED', 
  'ACTION_COMPLETED'
]; 

module.exports = mongoose.model('Event', {
	_id: 					{ type: mongoose.Schema.Types.ObjectId, required: true },
	id: 					{ type: String, required: true },
  type:	 				{ type: String, required: true, enum: eventTypes},
  class:        { type: String, required: true, enum: eventClasses },
	case:					{ type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
	createdAt: 		{ type: Date, required: true },
	createdBy:		{ type: String },
  data:         { type: Object }
});