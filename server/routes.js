const config = require('./config');
const uuid = require('node-uuid');
const Hashids = require('hashids/cjs');

var ObjectId = require('mongoose').Types.ObjectId; 
var Model = require('./model/model');

var hash = new Hashids();

Model.deleteMany({}, function(err) {	
	if (err) throw err;
	const john = new ObjectId();	
	Model.create({ _id: john, id: hash.encodeHex(john.toHexString()),  
		name: 'Mortgage', 
		description: 'Simple mortgage case.', 
		revision: 3, 
		starred: true, 
		author: 'John Doe' 
	});	
	const mary = new ObjectId();	
	Model.create({ _id: mary, id: hash.encodeHex(mary.toHexString()),  
		name: 'Loan', 
		description: 'Customer loan as we love it.', 
		revision: 1, 
		starred: true, 
		author: 'Mary Doe' 
	});	
	const jane = new ObjectId();	
	Model.create({ _id: jane, id: hash.encodeHex(jane.toHexString()),  
		name: 'Test', 
		description: 'A brand new product for the rest of us.', 
		revision: 1, 
		author: 'Jane Doe' 
	});	
});

module.exports = function (app) {

	// get models
	app.get('/api/models', function(req, res) {
		Model.find(function(err, models) {
			if (err) throw err;
			res.status(200).send(models);
		});
	});

	// update model
	app.put('/api/models/:id', function(req, res) {
		Model.findOneAndUpdate({_id: hash.decodeHex(req.params.id)}, {
			...req.body, 
			updatedAt: new Date()
		}, function(err) {
			if (err) throw err;
			res.status(204).send();
		});
	});

};