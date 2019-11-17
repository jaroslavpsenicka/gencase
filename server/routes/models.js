const Hashids = require('hashids/cjs');
const multer = require('multer');
const ObjectId = require('mongoose').Types.ObjectId; 
const Model = require('../model/model');
const Case = require('../model/case');

const hash = new Hashids();
const upload = multer({ storage: multer.memoryStorage() });

const formatCaseListData = (data, model) => {
	return {
		id: data.id,
		name: model.nameFormat ? formatValue(model.nameFormat, data) : data.name,
		description: model.descriptionFormat ? formatValue(model.descriptionFormat, data) : data.name,
		revision: data.revision,
		createdBy: data.createdBy,
		createdAt: data.createdAt,
		starred: data.starred
	}
}

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
				spec: payload
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
		Model.find()
			.select('-_id')
			.exec((err, models) => {
				if (err) throw err;
				res.status(200).send(models);
			});
	});

	// update model
	
	app.put('/api/models/:id', (req, res) => {
		console.log("Updating model", req.params.id, req.body);
		Model.findByIdAndUpdate(hash.decodeHex(req.params.id), {
			...req.body, 
			updatedAt: new Date()
		}, function(err) {
			if (err) throw err;
			res.status(204).send();
		});
	});

	// get cases belonging to a model	
	
	app.get('/api/models/:id/cases', (req, res) => {
		console.log("Querying cases of", req.params.id);
		Case.find({model: new ObjectId(hash.decodeHex(req.params.id))})
			.populate("model")
			.exec((err, data) => {
				if (err) throw err;
				res.status(200).send(data.map(m => formatCaseListData(m, m.model.spec)));
			});
	});

};