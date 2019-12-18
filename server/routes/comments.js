const Hashids = require('hashids/cjs');
const ObjectId = require('mongoose').Types.ObjectId; 
const Comment = require('../model/comment');
const Case = require('../model/case');

const hash = new Hashids();
const auth = require('../auth').auth;
const aud = require('../auth').aud;

/**
 * @typedef Comment
 * @property {string} id - unique identifier
 * @property {string} name - model name
 * @property {string} title - comment title
 * @property {integer} revision - revision number
 * @property {string}	createdBy - original author  
 * @property {string}	createdAt - creation date, UTC ISO date
 * @property {string}	updatedBy - last update author
 * @property {string}	updatedAt - last update date, UTC ISO date
 * @property {string} text - comment text
 */
module.exports = function (app) {

	/**
	 * Get comments belonging to given case.
	 * @route GET /api/cases/{caseId}/comments
	 * @group Case comments
   * @produces application/json
	 * @returns {[Comment.model]} 200 - An array of respective comments
	 * @returns {Error} 500 - system error
	 */
	app.get('/api/cases/:id/comments', auth, (req, res) => {
		Case
			.findOne({ aud: aud(req), id: req.params.id }, (err, theCase) => {
				if (err) throw err;
				if (!theCase) return res.status(404).send({ error: 'case not found' });

				Comment
					.find({ case: theCase._id })
					.select('-case')
					.exec((err, data) => {
						if (err) throw err;
						res.status(200).send(data);
					});
			});
	});

	/**
	 * Post new comment.
	 * @route POST /api/cases/{caseId}/comments
	 * @group Case comments
   * @produces application/json
	 * @returns {[Comment.model]} 201 - Created comment
	 * @returns {Error} 500 - system error
	 */
	app.post('/api/cases/:id/comments', auth, (req, res) => {
		Case
			.findOne({ aud: aud(req), id: req.params.id }, (err, theCase) => {
				if (err) throw err;
				if (!theCase) return res.status(404).send({ error: 'case not found' });

				const nid = new ObjectId();
				Comment
					.create({
						_id: nid,
						id: hash.encodeHex(nid.toHexString()), 		
						title: req.body.title,
						revision: 1,
						createdAt: new Date(),
						case: theCase._id,	
						text: req.body.text
					}, (err, doc) => {
						if (err) throw err;
						return res.status(201).send(doc);
					});
			});
	});

};