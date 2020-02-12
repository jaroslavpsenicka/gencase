const Notification = require('../model/notification');
const Hashids = require('hashids/cjs');

const hash = new Hashids();
const auth = require('../auth').auth;
const sub = require('../auth').sub;

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
	 * Return list of notifications for give user
	 * @route GET /api/notifications
	 * @group Notifications - user alerts and completion info
   * @produces application/json
	 * @returns {[Notification.model]} 200 - An array of respective cases
	 * @returns {Error} 500 - system error
	 */
	app.get('/api/notifications', auth, (req, res) => {
		Notification.find({ sub: sub(req) }, (err, data) => {
			if (err) throw err;
			return res.status(200).send(data);	
		})
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
		if (!req.body.seen) return res.status(400).send({ error: 'illegal parameter' })
		Notification.findOneAndUpdate({ sub: sub(req), id: req.params.id }, {
			seen: req.body.seen,
			updatedBy: sub(auth),
			updatedAt: new Date()
		}, (err, data) => {
			if (err) throw err;
			if (!data) return res.status(404).send();
			return res.status(204).send();
		});
  });

}