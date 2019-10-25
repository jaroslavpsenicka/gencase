const config = require('./config');
const uuid = require('node-uuid');
const Hashids = require('hashids/cjs');
const multer = require('multer');
const ObjectId = require('mongoose').Types.ObjectId; 
const Model = require('./model/model');
const fs = require('fs');

const hash = new Hashids();
const upload = multer({ storage: multer.memoryStorage() });

Model.deleteMany({}, function(err) {	
	if (err) throw err;
	const john = new ObjectId();	
	Model.create({ _id: john, id: hash.encodeHex(john.toHexString()),  
		name: 'Mortgage', 
		description: 'Simple mortgage case.', 
		revision: 3, 
		starred: true, 
		createdBy: 'John Doe',
		data: {}
	});	
	const mary = new ObjectId();	
	Model.create({ _id: mary, id: hash.encodeHex(mary.toHexString()),  
		name: 'Loan', 
		description: 'Customer loan as we love it.', 
		revision: 1, 
		starred: true, 
		createdBy: 'Mary Doe',
		data: {} 
	});	
	const jane = new ObjectId();	
	Model.create({ _id: jane, id: hash.encodeHex(jane.toHexString()),  
		name: 'Test', 
		description: 'A brand new product for the rest of us.', 
		revision: 1, 
		createdBy: 'Jane Doe',
		data: {} 
	});	
});

module.exports = function (app) {

	// upload model
	app.post('/api/models', upload.single("file"), (req, res) => {
		console.log("Uploading model", req.file.originalname);
		const nid = new ObjectId();
		const payload = JSON.parse(req.file.buffer);
		Model.create({
			_id: nid,
			id: hash.encodeHex(nid.toHexString()), 			
			name: payload.name,
			revision: 1,
			createdAt: new Date(),
			data: payload
		}, (err, model) => {
			if (err) throw err;
			res.status(201).send(model);
		});
	});

	// get models
	app.get('/api/models', (req, res) => {
		console.log("Retrieving models");
		Model.find(function(err, models) {
			if (err) throw err;
			res.status(200).send(models);
		});
	});

	// update model
	app.put('/api/models/:id', (req, res) => {
		console.log("Updating model", req.params.id, req.body);
		Model.findOneAndUpdate({_id: hash.decodeHex(req.params.id)}, {
			...req.body, 
			updatedAt: new Date()
		}, function(err) {
			if (err) throw err;
			res.status(204).send();
		});
	});

};