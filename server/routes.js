var config = require('./config');
var log4js = require('log4js');
var uuid = require('node-uuid');

var logger = log4js.getLogger('[route]');

var ObjectId = require('mongoose').Types.ObjectId; 
var Model = require('./model/model');

Model.deleteMany({}, function(err) {	
	if (err) throw err;
	Model.create({ _id: new ObjectId("507f1f77bcf86cd799439011"), 
		name: 'Mortgage', description: 'Simple mortgage case.', revision: 3, starred: true, author: 'John Doe' });	
	Model.create({ _id: new ObjectId("507f1f77bcf86cd799439012"), 
		name: 'Loan', description: 'Customer loan as we love it.', revision: 1, starred: true, author: 'Mary Doe' });	
	Model.create({ _id: new ObjectId("507f1f77bcf86cd799439013"), 
		name: 'Test', description: 'A brand new product for the rest of us.', revision: 1, author: 'John Doe' });	
});

module.exports = function (app) {

	// get models
	app.get('/api/models', function(req, res) {
		Model.find(function(err, models) {
			if (err) throw err;
			res.status(200).send(models);
		});
	});

};