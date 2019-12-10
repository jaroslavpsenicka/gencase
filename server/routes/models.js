const Hashids = require('hashids/cjs');
const multer = require('multer');
const ObjectId = require('mongoose').Types.ObjectId; 
const Model = require('../model/model');
const { ModelValidationError } = require('../errors');
const Ajv = require('ajv');
const fs = require('fs');
const log4js = require('log4js');
const getStream = require('get-stream')

const logger = log4js.getLogger();
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
			logger.info('registering', schemaName, 'schema');
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
		logger.info("uploading model", req.file.originalname);
		const nid = new ObjectId();
		try {
			const payload = parseAndValidate(fs.readFileSync(req.file.path).toString());
			Model.create({
				_id: nid,
				id: hash.encodeHex(nid.toHexString()), 			
				name: payload.name ? payload.name : nid,
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
		logger.info("retrieving models");
		Model.find()
			.select('-_id')
			.exec((err, models) => {
				if (err) throw err;
				res.status(200).send(models);
			});
	});

	// update model
	
	app.put('/api/models/:id', (req, res) => {
		logger.info(req.params.id, "- updating model", req.body);
		Model.findByIdAndUpdate(hash.decodeHex(req.params.id), {
			...req.body, 
			updatedAt: new Date()
		}, function(err) {
			if (err) throw err;
			res.status(204).send();
		});
	});

};