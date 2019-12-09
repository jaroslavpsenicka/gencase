const Hashids = require('hashids/cjs');
const multer = require('multer');
const ObjectId = require('mongoose').Types.ObjectId; 
const Document = require('../model/document');
const log4js = require('log4js');

const logger = log4js.getLogger();
const hash = new Hashids();
const upload = multer({ storage: multer.memoryStorage() });

module.exports = function (app) {

	// get case documents

	app.get('/api/cases/:id/documents', (req, res) => {
		logger.info(req.params.id, "- reading documents");
		Document.find({ case: new ObjectId(hash.decodeHex(req.params.id))})
			.select('-_id -contents') 
			.exec((err, data) => {
				if (err) throw err;
				res.status(200).send(data);
			});
	});

	// upload new document

	app.post('/api/cases/:id/documents', upload.single("file"), (req, res) => {
		logger.info(req.params.id, "uploading document", req.file.originalname);
		const nid = new ObjectId();
		try {
			Document.create({
				_id: nid,
				id: hash.encodeHex(nid.toHexString()), 			
				name: req.file.originalname,
				revision: 1,
				createdAt: new Date(),
				size: req.file.size,
				contents: req.file.buffer
			}, (err, doc) => {
				if (err) throw err;
				res.status(201).send(doc);
			});
		} catch (err) {
			res.status(400).send('Error processing the file.');
		}
	});

};