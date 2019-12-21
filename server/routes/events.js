const Event = require('../model/event');
const Case = require('../model/case');
const auth = require('../auth').auth;
const aud = require('../auth').aud;

/**
 * @typedef Event
 * @property {string} id - unique identifier
 * @property {string} class - event class: ACTION 
 * @property {string} type - event type: ACTION_STARTED, ACTION_CANCELLED, ACTION_COMPLETED
 * @property {string}	createdBy - original author  
 * @property {string}	createdAt - creation date, UTC ISO date
 * @property {string}	updatedBy - last update author
 * @property {string}	updatedAt - last update date, UTC ISO date
 * @property {object} data - event payload
 */
module.exports = function (app) {

	/**
	 * Get events belonging to given case.
	 * @route GET /api/cases/{caseId}/events
	 * @group Case events 
   * @produces application/json
	 * @returns {[Document.model]} 200 - An array of respective events
	 * @returns {Error} 500 - system error
	 */
	app.get('/api/cases/:id/events', auth, (req, res) => {
		Case
			.findOne({ aud: aud(req), id: req.params.id }, (err, theCase) => {
				if (err) throw err;
				if (!theCase) return res.status(404).send({ error: 'case not found' });

				Event
					.find({ case: theCase._id })
					.select('-case') 
					.exec((err, data) => {
						if (err) throw err;
						return res.status(200).send(data);
					});
			});
	});

};