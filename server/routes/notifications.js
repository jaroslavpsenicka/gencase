const Notification = require('../model/notification');
const Hashids = require('hashids/cjs');

const hash = new Hashids();
const auth = require('../auth').auth;
const aud = require('../auth').aud;
const sub = require('../auth').sub;

const PAGE_SIZE = 20;

/**
 * @typedef Notification
 * @property {string} id - unique identifier
 * @property {string} title - comment title
 * @property {string} text - notification text
 * @property {string} case - case identification
 * @property {string}	createdAt - creation date, UTC ISO date
 * @property {boolean} seen - seen by the user  
 */
module.exports = function (app) {

	/**
	 * Return list of notifications for given audience (aud field)
	 * @route GET /api/notifications
	 * @group Notifications - user alerts and completion info
   * @produces application/json
	 * @returns {[Notification.model]} 200 - An array of respective cases
	 * @returns {Error} 500 - system error
	 */
	app.get('/api/notifications', auth, (req, res) => {
		const page = req.query.page ? Math.max(0, parseInt(req.query.page)) : 0;
		const size = req.query.size ? Math.max(0, parseInt(req.query.size)) : PAGE_SIZE;
		Notification.find({ aud: aud(req) })
			.sort({ "createdAt": -1 })
			.skip(page * size)
			.limit(size)
			.exec((err, data) => {
				if (err) throw err;
				return res.status(200).send(data);	
			});
  });

	/**
	 * Update notification
   * currently only 'seen' flag.
	 * @route PUT /api/notifications
	 * @group Notifications - user alerts and completion info
   * @produces application/json
	 * @returns 204 - updated
	 * @returns {Error} 500 - system error
	 */
	app.put('/api/notifications/:id', auth, (req, res) => {
		const keys = Object.keys(req.body);
		if (keys.length != 1 || keys[0] != 'seen') {
			return res.status(400).send({ error: 'illegal parameter'});
		}
		Notification.findOneAndUpdate({ aud: aud(req), id: req.params.id }, {
			seen: req.body.seen,
			updatedBy: sub(auth),
			updatedAt: new Date()
		}, (err, data) => {
			if (err) throw err;
			if (!data) return res.status(404).send();
			return res.status(200).send(data);
		});
  });

}