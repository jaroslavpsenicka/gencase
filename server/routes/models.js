const Hashids = require('hashids/cjs');
const multer = require('multer');
const ObjectId = require('mongoose').Types.ObjectId; 
const Model = require('../model/model');
const { ModelValidationError } = require('../errors');
const Ajv = require('ajv');
const fs = require('fs');

const hash = new Hashids();
const upload = multer({ storage: multer.memoryStorage() });
const ajv = Ajv({ allErrors: true, removeAdditional: 'all' });

const schemaFileExt = '.schema.json'

fs.readdir('./server/model', (err, files) => {
	if (err) throw err;
  files.forEach(file => {
    if (file.endsWith(schemaFileExt)) {
			const schemaName = file.substring(0, file.length - schemaFileExt.length);
			console.log('registering', schemaName, 'schema');
			ajv.addSchema(require('../model/' + file), schemaName);
		}
  });
});


const parseAndValidate = (payload) => {
	const json = JSON.parse(payload);
	if (!ajv.validate('model', json)) {
		const path = ajv.errors[0].dataPath ? ajv.errors[0].dataPath.substring(1) + ": " : "";
		throw new ModelValidationError(path + ajv.errors[0].message);
	}
}

module.exports = function (app) {

	// upload model

	app.post('/api/models', upload.single("file"), (req, res) => {
		console.log("Uploading model", req.file.originalname);
		const nid = new ObjectId();
		try {
			const payload = parseAndValidate(req.file.buffer);
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
			if (err instanceof ModelValidationError) {
				res.status(400).json({error: err.message});
			} else res.status(500).json({error: err.message});
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

};