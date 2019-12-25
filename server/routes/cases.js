const Hashids = require('hashids/cjs');
const ObjectId = require('mongoose').Types.ObjectId;
const Case = require('../model/case');
const Model = require('../model/model');
const StateMachine = require('javascript-state-machine');
const request = require('request');
const log4js = require('log4js');
const Events = require('../events');

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

const findType = (model, state, key) => {
	const phase = model.phases.find(p => p.states ? p.states.includes(state) : false);
	if (!phase) throw 'cannot find phase for state ' + state;
	const entity = model.entities.find(m => m.name === phase.dataModel);
	if (!entity) throw 'cannot find entity ' + phase.dataModel;
	const attr = entity.attributes.find(a => a.name === key);
	if (!attr) throw 'cannot find attribute ' + key + ' in entity ' + phase.dataModel;
	return attr.type;
}

const toType = (field, type, value) => {
	console.log('converting', value, 'to', type)
	if (type === 'Number') {
		const rval = Number.parseInt(value);
		if (Number.isNaN(rval)) throw 'not a number: \'' + value + '\' in field \'' + field + '\'';
		return rval; 
	} else if (type === 'Date') {
		return new Date(value);
	}
	
	return value;
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
			.exec((err, theCase) => {
				if (err) throw err;
				if (!theCase) return res.status(404).send({ error: 'case not found' });

				// find all action-started events, 
				// these actions are currently running
				
				Events.findEvents(theCase._id, 'ACTION').then(
					events => res.status(200).json(getActions(theCase, events)), 
					err => { throw err }
				);
			});
	});	

	const getActions = (theCase, events) => {
		const runningActions = [];
		events.forEach(e => {
			if (e.type === 'ACTION_STARTED') runningActions.push(e.data.name);
			else runningActions.splice(runningActions.indexOf(e.data.name));
		});

		// calculate all possible transitions, 
		// allow already running actions to cancel 

		const sm = new StateMachine({
			init: theCase.state,
			transitions: theCase.model.spec.states.transitions
		});	
		const transitions = sm.transitions() || [];
		return transitions.map(tn => {
			return { 
				...theCase.model.spec.states.transitions.find(t => t.name === tn),
				cancel: runningActions.includes(tn)
			}
		});
	}; 

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
			.exec((err, theCase) => {
				if (err) throw err;
				if (!theCase) return res.status(404).send({ error: 'case not found' });

				// verify the action is not already running
				// and is valid according to state chart

				Events.findLastEvent(theCase._id, 'ACTION', { name: req.params.action }).then(
					event => performAction(theCase, event, req, res),
					err => { throw err }
				);
			});
	});

	const performAction = (theCase, event, req, res) => {
		if (event && event.type === 'ACTION_STARTED') {
			return res.status(400).json({ error: 'action \'' + req.params.action + '\' is already running'});
		}

		const sm = new StateMachine({
			init: theCase.state,
			transitions: theCase.model.spec.states.transitions
		});	
		const transitions = sm.transitions() || [];
		if (!transitions.find(t => t === req.params.action)) {
			res.status(400).json({ error: 'illegal action \'' + req.params.action + '\''});
			return;
		}

		// then perform transition (remote call)
		// and submit the action-started event

		const transition = theCase.model.spec.states.transitions.find(t => t.name === req.params.action);
		request.post({
			uri: Formatter.formatProcessUrl(theCase, transition.url), 
			headers: { 'Content-Type': 'application/json' }, 
			body: JSON.stringify(Formatter.formatProcessBody(theCase, transition.request)) 
		}, err => {
			if (err) return res.status(500).json({ error: err.message ? err.message : err });
			const createdBy = req.auth ? req.auth.sub : undefined;
			const eventData = { name: req.params.action };
			Events.submitEvent(theCase._id, 'ACTION_STARTED', createdBy, eventData).then(
				event => res.status(204).send(),
				err => { throw err }
			);
		});
	};

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
		Case
			.findById(new ObjectId(hash.decodeHex(req.params.id)))
			.populate("model")
			.exec((err, theCase) => {
				if (err) throw err;
				if (!theCase) return res.status(404).send({ error: 'case not found' });

				Events.findLastEvent(theCase._id, 'ACTION', { name: req.params.action }).then(
					event => completeAction(theCase, event, req, res),
					err => { throw err }
				);
			})
	});

	const completeAction = (theCase, event, req, res) => {
		if (event && event.type !== 'ACTION_STARTED') {
			return res.status(400).json({ error: 'illegal action ' + req.params.action })
		} 

		const transitions = theCase.model.spec.states.transitions; 
		const transition = transitions.find(t => t.name === req.params.action);

		// apply response mapping to the case
		// and case data

		try {
			Object.keys(transition.response).forEach(key => {
				if (UPDATABLE_PROPERTIES.includes(key)) {
					const fmt = transition.response[key];
					theCase[key] = Formatter.formatObject(fmt, req.body);
				}
			});
			Object.keys(transition.response.data).forEach(key => {
				const fmt = transition.response.data[key];
				const val = Formatter.formatObject(fmt, req.body);
				const type = findType(theCase.model.spec, theCase.state, key);
				theCase.data.set(key, toType(key, type, val));
			});
		} catch (err) {
			return res.status(400).json({ error: err })
		}

		theCase.state = transition.to;
		theCase.save(err => {
			if (err) throw err;
			const createdBy = req.auth ? req.auth.sub : undefined;
			const eventData = { name: req.params.action };
			Events.submitEvent(theCase._id, 'ACTION_COMPLETED', createdBy, eventData).then(
				event => res.status(204).send(),
				err => { 
					console.err('error saving event ACTION_COMPLETED for case ' + theCase.id); 
					throw err; 
				}
			);
		});
	}

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
			.exec((err, theCase) => {
				if (err) throw err;
				if (!theCase) return res.status(404).send({ error: 'case not found' });

				Events.findLastEvent(theCase._id, 'ACTION', { name: req.params.action }).then(
					event => cancelAction(theCase, event, req, res),
					err => { throw err }
				);
			});
	});

	const cancelAction = (theCase, event, req, res) => {
		if (event && event.data.name === req.params.action && event.type !== 'ACTION_STARTED') {
			return res.status(400).json({ error: 'illegal action ' + req.params.action })
		} 

		const createdBy = req.auth ? req.auth.sub : undefined;
		const eventData = { name: req.params.action };
		Events.submitEvent(theCase._id, 'ACTION_CANCELLED', createdBy, eventData).then(
			() => { return res.status(204).send() },
			err => { throw err }
		);
	}

}