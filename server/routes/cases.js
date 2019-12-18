const Hashids = require('hashids/cjs');
const ObjectId = require('mongoose').Types.ObjectId;
const Case = require('../model/case');
const Model = require('../model/model');
const StateMachine = require('javascript-state-machine');
const request = require('request');
const log4js = require('log4js');

const logger = log4js.getLogger('cases')
const hash = new Hashids();
const Formatter = require('../formatters');
const auth = require('../auth').auth;
const aud = require('../auth').aud;

const UPDATABLE_PROPERTIES = ['name', 'starred'];

const validateAgainstModel = (model, values, data) => {
	const initialPhase = model.spec.phases.find(p => p.initial);			
	if (!initialPhase) throw "no initial phase defined for " + model.name;

	const entity = model.spec.entities.find(e => e.name == initialPhase.dataModel);
	if (!entity) throw "entity '" + initialPhase.dataModel + "' not defined"

	const requiredAttributes = entity.attributes.filter(a => a.notEmpty);
	logger.debug('verifying attributes', requiredAttributes.map(a => a.name));
	requiredAttributes.forEach(a => {
		const value = values[a.name];
		if (value) data.set(a.name, value);	
		else throw "should have required property '" + a.name + "'";
	});
}

/**
 * @typedef Case
 * @property {string} id - unique identifier
 * @property {string} name - model name
 * @property {string} title - comment title
 * @property {integer} revision - revision number
 * @property {string}	createdBy - original author  
 * @property {string}	createdAt - creation date, UTC ISO date
 * @property {string}	updatedBy - last update author
 * @property {string}	updatedAt - last update date, UTC ISO date
 */
module.exports = function (app) {

	/**
	 * Create a new case.
	 * @route POST /api/models/{modelId}/cases
	 * @group Cases - Main data here
   * @produces application/json
	 * @returns {[Case.model]} 200 - An array of respective cases
	 * @returns {Error} 500 - system error
	 */
	app.post('/api/models/:id/cases', auth, (req, res) => {
		Model.findById(new ObjectId(hash.decodeHex(req.params.id)), (err, model) => {
			if (err) throw err;
			const data = new Map([]);

			// Validate input against initial phase model

			try {
				validateAgainstModel(model, req.body, data);
			} catch (error) {
				return res.status(400).json({ error: error });
			} 

			// Then create data entity

			const caseId = new ObjectId();	
			Case.create({ _id: caseId, 
				id: hash.encodeHex(caseId.toHexString()),  
				aud: req.auth ? req.auth.aud : undefined,
				name: "Case " + caseId, 
				revision: 1, 
				starred: false,
				createdBy: req.auth ? req.auth.sub : undefined,
				createdAt: new Date(),
				model: model._id,
				state: model.spec.states.init,
				data: data
			}, (err, caseObject) => {
				if (err) throw err;
				const resp = { ...caseObject.toObject(), data: Formatter.toObject(caseObject.get('data')) };
				res.status(201).send(resp);
			});	
		
		});
	});

	/**
	 * Get cases belonging to given model.
	 * @route GET /api/models/{modelId}/cases
	 * @group Cases - Main data here
   * @produces application/json
	 * @returns {[Case.model]} 200 - An array of respective cases
	 * @returns {Error} 500 - system error
	 */
	app.get('/api/models/:id/cases', auth, (req, res) => {
		Case
			.find({ aud: aud(req), model: new ObjectId(hash.decodeHex(req.params.id)) })
			.populate("model")
			.exec((err, data) => {
				if (err) throw err;
				res.status(200).send(data.map(m => Formatter.formatCaseList(m, m.model.spec)));
			});
	});

	/**
	 * Get cases metadata.
	 * @route GET /api/cases/{caseId}/metadata
	 * @group Cases - Main data here
   * @produces application/json
	 * @returns {Case.model} 200 - Case metadata
	 * @returns {Error} 500 - system error
	 */
	app.get('/api/cases/:id/metadata', auth, (req, res) => {
		Case
			.findOne({ aud: aud(req), id: req.params.id })
			.populate("model")
			.exec((err, data) => {
				if (err) throw err;
				if (!data) return res.status(404).send({ error: 'case not found' });
				return res.status(200).send(Formatter.formatCaseMetadata(data, data.model.spec));
			});
	});

		/**
	 * Update case metadata, only a selected set of properties may be updated.
	 * @route PUT /api/cases/{caseId}/metadata
	 * @group Cases - Main data here
   * @produces application/json
	 * @returns {Case.model} 200 - Case metadata
	 * @returns {Error} 500 - system error
	 */
	app.put('/api/cases/:id/metadata', auth, (req, res) => {
		try {
			Object.keys(req.body).forEach(k => {
				if (!UPDATABLE_PROPERTIES.includes(k)) {
					throw 'cannot update property \'' + k + '\'';
				}
			});
		} catch (err) {
			return res.status(400).send({ error: err });
		}

		Case.findOneAndUpdate({ aud: aud(req), id: req.params.id }, {
			...req.body, updatedAt: new Date(), $inc: { revision: 1 }
		}, (err, data) => {
			if (err) throw err;
			if (!data) return res.status(404).send();
			return res.status(204).send();
		});
	});

	/**
	 * Get cases data.
	 * @route GET /api/cases/{caseId}
	 * @group Cases - Main data here
   * @produces application/json
	 * @returns 200 - Case data, corresponds to a model
	 * @returns {Error} 500 - system error
	 */
	app.get('/api/cases/:id', auth, (req, res) => {
		Case
			.findOne({ aud: aud(req), id: req.params.id })
			.populate("model")
			.exec((err, data) => {
				if (err) throw err;
				if (!data) return res.status(404).send({ error: 'case not found' });
				return res.status(200).send(Formatter.formatCaseData(data, data.model.spec));
			});
	});
	
	/**
	 * Update case data, corresponding to model schema.
	 * @route PUT /api/cases/{caseId}
	 * @group Cases - Main data here
   * @produces application/json
	 * @returns {Case.model} 200 - Case metadata
	 * @returns {Error} 500 - system error
	 */
	app.put('/api/cases/:id', auth, (req, res) => {
		Case
			.findOne({ aud: aud(req), id: req.params.id })
			.populate("model")
			.exec((err, caseObject) => {
				if (err) throw err;
				if (!caseObject) return res.status(404).send({ error: 'case not found'});

				// Validate input against initial phase model

				try {
					const update = { ...Formatter.toObject(caseObject.data), ...req.body };
					validateAgainstModel(caseObject.model, update, caseObject.data);
					caseObject.save(err => {
						if (err) throw err;
						return res.status(204).send();
					});
				} catch (error) {
					return res.status(400).json({ error: error });
				} 

			});
	});
	
	/**
	 * Get case overview fields.
	 * @route GET /api/cases/{caseId}/overview
	 * @group Cases - Main data here
   * @produces application/json
	 * @returns {Case.model} 200 - Case overview fields
	 * @returns {Error} 500 - system error
	 */
	app.get('/api/cases/:id/overview', auth, (req, res) => {
		Case
		.findOne({ aud: aud(req), id: req.params.id })
		.populate("model")
		.exec((err, data) => {
			if (err) throw err;
			if (!data) return res.status(404).send({ error: 'case not found'});
			return res.status(200).send(Formatter.formatCaseOverview(data, data.model.spec));
		});
	});

	/**
	 * Get case actions.
	 * @route GET /api/cases/{caseId}/actions
	 * @group Cases - Main data here
   * @produces application/json
	 * @returns {Action.model} 200 - Case overview fields
	 * @returns {Error} 500 - system error
	 */
	app.get('/api/cases/:id/actions', auth, (req, res) => {
		Case
			.findOne({ aud: aud(req), id: req.params.id })
			.populate("model")
			.exec((err, data) => {
				if (err) throw err;
				if (!data) return res.status(404).send({ error: 'case not found' });

				// if the transition is running, allow cancelling only
				// otherwise list all transitions and show them as actions

				if (data.transition) {
					const tspec = data.model.spec.states.transitions.find(t => t.name === data.transition)
					return res.status(200).json([{
						name: data.transition,
						label: 'Cancel ' + tspec.to,
						to: tspec.to,
						cancel: true 
					}]);
				} else {
					const sm = new StateMachine({
						init: data.state,
						transitions: data.model.spec.states.transitions
					});	
					const transitions = sm.transitions() || [];
					res.status(200).json(transitions.map(tn => {
						return data.model.spec.states.transitions.find(t => {
							return t.name === tn;
						});
					}));
				}
			});
	});	

	/**
	 * Perform case action.
	 * @route GET /api/cases/{caseId}/actions/{action}
	 * @group Cases - Main data here
   * @produces application/json
	 * @returns {Case.model} 204 - Case overview fields
	 * @returns {Error} 400 - Illegal action
	 * @returns {Error} 500 - system error
	 */
	app.post('/api/cases/:id/actions/:action', auth, (req, res) => {
		Case
			.findOne({ aud: aud(req), id: req.params.id })
			.populate("model")
			.exec((err, data) => {
				if (err) throw err;
				if (!data) return res.status(404).send({ error: 'case not found' });

				// verify the action is valid first

				const sm = new StateMachine({
					init: data.state,
					transitions: data.model.spec.states.transitions
				});	
				const transitions = sm.transitions() || [];
				if (!transitions.find(t => t === req.params.action)) {
					res.status(400).json({ error: 'illegal action \'' + req.params.action + '\''});
					return;
				}

				// then perform transition

				const transition = data.model.spec.states.transitions.find(t => t.name === req.params.action);
				request.post({
					uri: Formatter.formatProcessUrl(data, transition.url), 
					headers: { 'Content-Type': 'application/json' }, 
					body: JSON.stringify(Formatter.formatProcessBody(data, transition.payload)) 
				}, err => {
					if (err) return res.status(500).json({ error: err.message ? err.message : err });
					data.transition = req.params.action;
					data.save(err => {
						if (err) throw err;
						return res.status(204).send();
					})
				});
			});
	});

	/**
	 * Receive case callback.
	 * @route POST /api/cases/{caseId}/actions/callback
	 * @group Cases - Main data here
   * @produces application/json
	 * @returns 204 - Success
	 * @returns {Error} 400 - Illegal action
	 * @returns {Error} 500 - system error
	 */
	app.post('/api/cases/:id/actions/:action/callback', (req, res) => {
		Case.findById(new ObjectId(hash.decodeHex(req.params.id)))
			.populate("model")
			.exec((err, data) => {
				if (err) throw err;

				// verify the action is valid first

				if (data.transition !== req.params.action) {
					res.status(400).json({ error: 'illegal action ' + req.params.action });
					return;
				}

				// then switch to new state

				const transition = data.model.spec.states.transitions.find(t => t.name === req.params.action);
				data.transition = undefined;
				data.state = transition.to;
				data.save(err => {
					if (err) throw err;
					res.status(204).send();
				});
			})
	});

	/**
	 * Cancel the transition.
	 * @route DELETE /api/cases/{caseId}/actions/{action}
	 * @group Cases - Main data here
   * @produces application/json
	 * @returns 204 - Success
	 * @returns {Error} 400 - Illegal action
	 * @returns {Error} 500 - system error
	 */
	app.delete('/api/cases/:id/actions/:action', auth, (req, res) => {
		Case
			.findOne({ aud: aud(req), id: req.params.id })
			.populate("model")
			.exec((err, data) => {
				if (err) throw err;
				if (!data) return res.status(404).send({ error: 'case not found' });

					// verify the transition is valid first, then reset the transition

				if (data.transition !== req.params.action) {
					res.status(400).json({ error: 'illegal action ' + req.params.action });
					return;
				}
				
				// then simply reset the transition

				data.transition = undefined;
				data.save(err => {
					if (err) throw err;
					res.status(204).send();
				});
			});
	});

}