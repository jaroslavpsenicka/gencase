const config = require('./config');
const uuid = require('node-uuid');
const Hashids = require('hashids/cjs');
const multer = require('multer');
const ObjectId = require('mongoose').Types.ObjectId; 
const Model = require('./model/model');
const Case = require('./model/case');

const hash = new Hashids();
const upload = multer({ storage: multer.memoryStorage() });

const mortgage = new ObjectId();	
const loan = new ObjectId();	
const test = new ObjectId();	

Model.deleteMany({}, (err) => {	
	if (err) throw err;
	Model.create({ _id: mortgage, id: hash.encodeHex(mortgage.toHexString()),  
		name: 'Mortgage', 
		description: 'Simple mortgage case.', 
		revision: 3, 
		starred: true, 
		createdBy: 'John Doe',
		model: {}
	});	
	Model.create({ _id: loan, id: hash.encodeHex(loan.toHexString()),  
		name: 'Loan', 
		description: 'Customer loan as we love it.', 
		revision: 1, 
		starred: true, 
		createdBy: 'Mary Doe',
		model: {} 
	});	
	Model.create({ _id: test, id: hash.encodeHex(test.toHexString()),  
		name: 'Test', 
		description: 'A brand new product for the rest of us.', 
		revision: 1, 
		createdBy: 'Jane Doe',
		model: {} 
	});	
});

Case.deleteMany({}, (err) => {	
	if (err) throw err;
	const case1 = new ObjectId();	
	Case.create({ _id: case1, id: hash.encodeHex(case1.toHexString()),  
		name: "John's Mortgage", 
		description: 'Yeah, new house.', 
		revision: 3, 
		createdBy: 'Mary Doe',
		modelId: mortgage
	});	
});

module.exports = function (app) {

	// upload model
	app.post('/api/models', upload.single("file"), (req, res) => {
		console.log("Uploading model", req.file.originalname);
		const nid = new ObjectId();
		try {
			const payload = JSON.parse(req.file.buffer);
			Model.create({
				_id: nid,
				id: hash.encodeHex(nid.toHexString()), 			
				name: payload.name,
				revision: 1,
				createdAt: new Date(),
				model: payload
			}, (err, model) => {
				if (err) throw err;
				res.status(201).send(model);
			});
		} catch (err) {
			res.status(400).send('Error processing the file.');
		}
	});

	// get models
	app.get('/api/models', (req, res) => {
		console.log("Retrieving models");
		Model.find((err, models) => {
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

	// get cases
	app.get('/api/models/:id/cases', (req, res) => {
		console.log("Querying cases of ", req.params.id, req.body);
		Case.find({modelId: new ObjectId(hash.decodeHex(req.params.id))}, (err, data) => {
			if (err) throw err;
			res.status(200).send(data);
		});
	});

};