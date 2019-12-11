const Hashids = require('hashids/cjs');
const multer = require('multer');
const ObjectId = require('mongoose').Types.ObjectId; 
const Model = require('../model/model');
const { ModelValidationError } = require('../errors');
const Ajv = require('ajv');
const fs = require('fs');

const hash = new Hashids();
const disk = multer.diskStorage({
	destination: function (req, file, cb) { cb(null, '/tmp')},
  filename: function (req, file, cb) { cb(null, file.fieldname + '-' + Date.now())}
});
const upload = multer({ storage: disk });
const ajv = Ajv({ allErrors: true, removeAdditional: 'all' });

const schemaFileExt = '.schema.json'

fs.readdir('./server/model', (err, files) => {
	if (err) throw err;
  files.forEach(file => {
    if (file.endsWith(schemaFileExt)) {
			const schemaName = file.substring(0, file.length - schemaFileExt.length);
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

	return json;
}

module.exports = function (app) {

	// upload model

	app.post('/api/models', upload.single("file"), (req, res) => {
		const nid = new ObjectId();
		try {
			const payload = parseAndValidate(fs.readFileSync(req.file.path).toString());
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
		Model.find((err, models) => {
			if (err) throw err;
			res.status(200).send(models);
		});
	});

	// get model by id

	app.get('/api/models/:model', (req, res) => {
		Model.findOne((err, model) => {
			if (err) throw err;
			res.status(200).send(model);
		});
	});
	
	// update model
	
	app.put('/api/models/:id', (req, res) => {
		Model.findByIdAndUpdate(hash.decodeHex(req.params.id), {
			...req.body, 
			updatedAt: new Date()
		}, function(err) {
			if (err) throw err;
			res.status(204).send();
		});
	});

};