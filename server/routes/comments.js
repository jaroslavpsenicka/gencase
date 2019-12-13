const Hashids = require('hashids/cjs');
const ObjectId = require('mongoose').Types.ObjectId; 
const Comment = require('../model/comment');

const hash = new Hashids();

module.exports = function (app) {

	// get case comments

	app.get('/api/cases/:id/comments', (req, res) => {
		Comment.find({ case: new ObjectId(hash.decodeHex(req.params.id))})
			.select('-case')
			.exec((err, data) => {
				if (err) throw err;
				res.status(200).send(data);
			});
	});

	// post a comment

	app.post('/api/cases/:id/comments', (req, res) => {
		const nid = new ObjectId();
		Comment.create({
			_id: nid,
			id: hash.encodeHex(nid.toHexString()), 		
			title: req.body.title,
			revision: 1,
			createdAt: new Date(),
			case: new ObjectId(hash.decodeHex(req.params.id)),	
			text: req.body.text
		}, err => {
			if (err) throw err;
			return res.status(201).send();
		});
	});
	
};