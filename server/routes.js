var config = require('./config');
var log4js = require('log4js');
var uuid = require('node-uuid');

var logger = log4js.getLogger('[route]');

module.exports = function (app) {

	// get all cases
	app.get('/api/cases', function(req, res) {
		// var user = tokens[req.params.userToken];
		// if (!user) res.status(401).send({ message: 'not authorized' });
		// User.find({}, function(err, users) {
		// 	if (err) throw err;				
		// 	res.status(200).send(users);				
		// });
	});

};