const fs = require('fs');
const Hashids = require('hashids/cjs');
const multer = require('multer');
const ObjectId = require('mongoose').Types.ObjectId; 
const Document = require('../model/document');

const hash = new Hashids();
const disk = multer.diskStorage({
	destination: function (req, file, cb) { cb(null, '/tmp')},
  filename: function (req, file, cb) { cb(null, file.fieldname + '-' + Date.now())}
});
const upload = multer({ storage: disk });

module.exports = function (app) {

	// get case documents

	app.get('/api/cases/:id/documents', (req, res) => {
		Document.find({ case: new ObjectId(hash.decodeHex(req.params.id))})
			.select('-contents -case') 
			.exec((err, data) => {
				if (err) throw err;
				return res.status(200).send(data);
			});
	});

	// upload new document

	app.post('/api/cases/:id/documents', upload.single("file"), (req, res) => {
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

};