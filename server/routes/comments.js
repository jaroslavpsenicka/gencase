const Hashids = require('hashids/cjs');
const multer = require('multer');
const ObjectId = require('mongoose').Types.ObjectId; 
const Comment = require('../model/comment');
const log4js = require('log4js');

const logger = log4js.getLogger();
const hash = new Hashids();

module.exports = function (app) {

	// get case comments

	app.get('/api/cases/:id/comments', (req, res) => {
		logger.info(req.params.id, "- reading comments");
		Comment.find({ case: new ObjectId(hash.decodeHex(req.params.id))})
			.select('-_id')
			.exec((err, data) => {
				if (err) throw err;
				res.status(200).send(data);
			});
	});

};