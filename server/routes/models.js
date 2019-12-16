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

/**
 * @typedef Model
 * @property {string} id - unique identifier
 * @property {string} name - model name
 * @property {string} description - model description
 * @property {integer} revision - revision number
 * @property {string}	createdBy - original author  
 * @property {string}	createdAt - creation date, UTC ISO date
 * @property {string}	updatedBy - last update author
 * @property {string}	updatedAt - last update date, UTC ISO date
 * @property {boolean}	starred - a star flag used to differenciate models
 */
module.exports = function (app) {

	/**
	 * Upload model.
	 * @route POST /api/models
	 * @group Models - Model operations
   * @param {file} file.required - model definition file
   * @consumes multipart/data
   * @produces application/json
	 * @returns {Model.model} 201 - successfully uploaded 
	 * @returns {Error} 500 - system error
	 */
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
	
	/**
	 * Get models.
	 * @route GET /api/models
	 * @group Models - Model operations
   * @produces application/json
	 * @returns {[Model.model]} 200 - An array of model information info
	 * @returns {Error} 500 - system error
	 */
	app.get('/api/models', (req, res) => {
		Model.find((err, models) => {
			if (err) throw err;
			res.status(200).send(models);
		});
	});

	/**
	 * Get model by id.
	 * @route GET /api/models/{id}
	 * @group Models - Model operations
	 * @param {string} id - model id
   * @produces application/json
	 * @returns {Model.model} 200 - Model information info
	 * @returns {Error} 500 - system error
	 */
	app.get('/api/models/:model', (req, res) => {
		Model.findOne((err, model) => {
			if (err) throw err;
			res.status(200).send(model);
		});
	});
	
	/**
	 * Update model by id.
	 * @route PUT /api/models/{id}
	 * @group Models - Model operations
	 * @param {string} id - model id
   * @produces application/json
	 * @returns 204 
	 * @returns {Error} 500 - system error
	 */
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