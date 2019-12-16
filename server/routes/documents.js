const fs = require('fs');
const Hashids = require('hashids/cjs');
const multer = require('multer');
const ObjectId = require('mongoose').Types.ObjectId; 
const Document = require('../model/document');
const Case = require('../model/case');

const hash = new Hashids();
const disk = multer.diskStorage({
	destination: function (req, file, cb) { cb(null, '/tmp')},
  filename: function (req, file, cb) { cb(null, file.fieldname + '-' + Date.now())}
});
const upload = multer({ storage: disk });

/**
 * @typedef Document
 * @property {string} id - unique identifier
 * @property {string} name - model name
 * @property {string} description - model description
 * @property {integer} revision - revision number
 * @property {string}	createdBy - original author  
 * @property {string}	createdAt - creation date, UTC ISO date
 * @property {string}	updatedBy - last update author
 * @property {string}	updatedAt - last update date, UTC ISO date
 * @property {integer} size - document size
 */
module.exports = function (app) {

	/**
	 * Get document belonging to given case.
	 * @route GET /api/cases/{caseId}/documents
	 * @group Cases - Main data here
   * @produces application/json
	 * @returns {[Document.model]} 200 - An array of respective documents
	 * @returns {Error} 500 - system error
	 */
	app.get('/api/cases/:id/documents', (req, res) => {
		Document.find({ case: new ObjectId(hash.decodeHex(req.params.id))})
			.select('-contents -case') 
			.exec((err, data) => {
				if (err) throw err;
				return res.status(200).send(data);
			});
	});

	/**
	 * Upload new document.
	 * @route POST /api/cases/{caseId}/documents
	 * @group Cases - Main data here
   * @produces application/json
	 * @returns {[Document.model]} 20+ - Document without contents
	 * @returns {Error} 500 - system error
	 */
	app.post('/api/cases/:id/documents', upload.single("file"), (req, res) => {
		Case.findById(new ObjectId(hash.decodeHex(req.params.id)), (err, data) => {
			if (err) throw err;
			if (!data) return res.status(404).json({ error: 'case not found: ' + req.params.id });
			const nid = new ObjectId();
			Document.create({
				_id: nid,
				id: hash.encodeHex(nid.toHexString()), 		
				name: req.file.originalname,
				revision: 1,
				createdAt: new Date(),
				size: req.file.size,
				case: new ObjectId(hash.decodeHex(req.params.id)),	
				contents: fs.readFileSync(req.file.path).toString()
			}, (err, doc) => {
				if (err) throw err;
				return res.status(201).send({ ...doc.toObject(), case: undefined, contents: undefined });
			});
		});
	});

};