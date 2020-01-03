const Hashids = require('hashids/cjs');
const ObjectId = require('mongoose').Types.ObjectId;
const Case = require('../model/case');
const Model = require('../model/model');
const request = require('request');
const log4js = require('log4js');
const eventService = require('../services/event-service');
const transitionService = require('../services/transition-service');

const config = require('../config');
const hash = new Hashids();
const Formatter = require('../formatters');
const auth = require('../auth').auth;
const aud = require('../auth').aud;

const UPDATABLE_PROPERTIES = config.cases.updatableProperties;

const validateNewCase = (model, values, caseData) => {
	const initialPhase = model.spec.phases.find(p => p.initial);			
	if (!initialPhase) throw "no initial phase defined for " + model.name;

	const entity = model.spec.entities.find(e => e.name == initialPhase.dataModel);
	if (!entity) throw "entity '" + initialPhase.dataModel + "' not defined"

	validateCase(entity, values, caseData);
}

const validateCase = (entity, values, caseData) => {

	// validate required attributes

	const requiredAttributes = entity.attributes.filter(a => a.notEmpty);
	requiredAttributes.forEach(a => {
		const value = values[a.name];
		if (value) caseData.set(a.name, value);	
		else throw "should have required property '" + a.name + "'";
	});

	// validate attribute value

	entity.attributes.forEach(a => validateAttribute(a, values[a.name]));
}

const validateAttribute = (attribute, value) => {
	if (attribute.type === 'Number') {
		if (attribute.min && value < attribute.min) throw "property '" + attribute.name + "' should be < " + attribute.min;
		if (attribute.max && value > attribute.max) throw "property '" + attribute.name + "' should be > " + attribute.max;
	}
}

const findEntity = (model, state) => {
	const phase = model.spec.phases.find(p => (p.states && p.states.includes(state)));
	if (!phase) throw "cannot find phase for state " + state;
	return model.spec.entities.find(e => e.name === phase.dataModel);
}

const findAttribute = (model, state, key) => {
	const phase = model.phases.find(p => p.states ? p.states.includes(state) : false);
	if (!phase) throw 'cannot find phase for state ' + state;
	const entity = model.entities.find(m => m.name === phase.dataModel);
	if (!entity) throw 'cannot find entity ' + phase.dataModel;
	const attr = entity.attributes.find(a => a.name === key);
	if (!attr) throw 'cannot find attribute ' + key + ' in entity ' + phase.dataModel;
	return attr;
}

const toType = (field, type, value) => {
	if (type === 'Number') {
		const rval = Number.parseInt(value);
		if (Number.isNaN(rval)) throw 'not a number: \'' + value + '\' in field \'' + field + '\'';
		return rval; 
	} else if (type === 'Boolean') {
		if (!(value instanceof Boolean) && value !== 'true' && value !== 'false') throw 'not a boolean: \'' + value + '\' in field \'' + field + '\'';
		return value;
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
				validateNewCase(model, req.body, data);
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
					const entity = findEntity(caseObject.model, caseObject.state);
					validateCase(entity, update, caseObject.data, caseObject.phase);
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
				
				eventService.findEvents(theCase.id, 'ACTION').then(
					events => res.status(200).json(transitionService.getActions(theCase, events)), 
					err => { throw err }
				);
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
			.exec((err, theCase) => {
				if (err) throw err;
				if (!theCase) return res.status(404).send({ error: 'case not found' });

				// verify the action is not already running
				// and is valid according to state chart

				eventService.findLastEventByName(theCase.id, 'ACTION', req.params.action).then(
					event => performAction(theCase, event, req, res),
					err => { throw err }
				);
			});
	});

	const performAction = (theCase, event, req, res) => {
		if (event && event.type === 'ACTION_STARTED') {
			return res.status(400).json({ error: 'action \'' + req.params.action + '\' is already running'});
		}

		// valdate first

		if (!transitionService.canRunAction(theCase, req.params.action)) {
			return res.status(400).json({ error: 'illegal action \'' + req.params.action + '\''});
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
			eventService.submitEvent(theCase.id, 'ACTION_STARTED', createdBy, eventData).then(
				() => res.status(204).send(),
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

				eventService.findLastEventByName(theCase.id, 'ACTION', req.params.action).then(
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
				const attr = findAttribute(theCase.model.spec, theCase.state, key);
				validateAttribute(attr, val);
				theCase.data.set(key, toType(key, attr.type, val));
			});
		} catch (err) {
			return res.status(400).json({ error: err })
		}

		theCase.state = transition.to;
		theCase.save(err => {
			if (err) throw err;
			const createdBy = req.auth ? req.auth.sub : undefined;
			const eventData = { name: req.params.action };
			eventService.submitEvent(theCase.id, 'ACTION_COMPLETED', createdBy, eventData).then(
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

				eventService.findLastEventByName(theCase.id, 'ACTION', req.params.action).then(
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
		eventService.submitEvent(theCase.id, 'ACTION_CANCELLED', createdBy, eventData).then(
			() => { return res.status(204).send() },
			err => { throw err }
		);
	}

	/**
	 * Get events belonging to given case.
	 * @route GET /api/cases/{caseId}/events
	 * @group Case events 
   * @produces application/json
	 * @returns {[Event.model]} 200 - An array of respective events
	 * @returns {Error} 500 - system error
	 */
	app.get('/api/cases/:id/events', auth, (req, res) => {
		Case
			.findOne({ aud: aud(req), id: req.params.id }, (err, theCase) => {
				if (err) throw err;
				if (!theCase) return res.status(404).send({ error: 'case not found' });

				eventService.findEvents(theCase.id)
					.then(data => res.status(200).send(data))
					.catch(err => { throw err });
			});
	});

}