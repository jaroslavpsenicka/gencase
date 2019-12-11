const Hashids = require('hashids/cjs');
const ObjectId = require('mongoose').Types.ObjectId;
const Case = require('../model/case');
const Model = require('../model/model');
const StateMachine = require('javascript-state-machine');
const Axios = require('axios');

const hash = new Hashids();
const Formatter = require('../formatters');

const HTTP_CONFIG = {
	headers: {
		'Content-Type': 'application/json'
	}
};

const validateModel = (model, values, data) => {
	const initialPhase = model.spec.phases.find(p => p.initial);			
	if (!initialPhase) throw "no initial phase defined for " + model.name;

	const entity = model.spec.entities.find(e => e.name == initialPhase.dataModel);
	if (!entity) throw "entity '" + initialPhase.dataModel + "' not defined"

	const requiredAttributes = entity.attributes.filter(a => a.notEmpty);
	requiredAttributes.forEach(a => {
		const value = values[a.name];
		if (value) data.set(a.name, value);	
		else throw "should have required property '" + a.name + "'";
	});
}

module.exports = function (app) {

	// get cases	
	
	app.get('/api/models/:id/cases', (req, res) => {
		Case.find({model: new ObjectId(hash.decodeHex(req.params.id))})
			.populate("model")
			.exec((err, data) => {
				if (err) throw err;
				res.status(200).send(data.map(m => Formatter.formatCaseList(m, m.model.spec)));
			});
	});

	// create a new case

	app.post('/api/models/:id/cases', (req, res) => {
		Model.findById(new ObjectId(hash.decodeHex(req.params.id)), (err, model) => {
			if (err) throw err;
			const data = new Map([]);

			// Validate input against initial phase model

			try {
				validateModel(model, req.body, data);
			} catch (error) {
				return res.status(400).json({
					error: error
				});
			} 

			// Then create data entity

			const caseId = new ObjectId();	
			Case.create({ _id: caseId, 
				id: hash.encodeHex(caseId.toHexString()),  
				name: "Case " + caseId, 
				revision: 1, 
				starred: false,
				createdBy: 'Mary Doe',
				createdAt: new Date(),
				model: model._id,
				data: data
			}, (err, caseObject) => {
				if (err) throw err;
				const resp = { ...caseObject.toObject(), data: Formatter.toObject(caseObject.get('data')) };
				res.status(200).send(resp);
			});	
		
		});
	});

	// get case data

	app.get('/api/cases/:id', (req, res) => {
		Case.findById(new ObjectId(hash.decodeHex(req.params.id)))
			.populate("model")
			.exec((err, data) => {
				if (err) throw err;
				res.status(200).send(Formatter.formatCase(data, data.model.spec));
			});
	});

	// update case

	app.put('/api/cases/:id', (req, res) => {
		Case.findByIdAndUpdate(hash.decodeHex(req.params.id), {
			...req.body,
			updatedAt: new Date()
		}, err => {
			if (err) throw err;
			res.status(204).send();
		});
	});

	// get case detail data

	app.get('/api/cases/:id/overview', (req, res) => {
		Case.findById(new ObjectId(hash.decodeHex(req.params.id)))
			.populate("model")
			.exec((err, data) => {
				if (err) throw err;
				res.status(200).send(Formatter.formatCaseOverview(data, data.model.spec));
			});
	});

	// get case actions
	
	app.get('/api/cases/:id/actions', (req, res) => {
		Case.findById(new ObjectId(hash.decodeHex(req.params.id)))
			.populate("model")
			.exec((err, data) => {
				if (err) throw err;

				// if the transition is running, allow cancelling only
				// otherwise list all transitions and show them as actions

				if (data.transition) {
					const tspec = data.model.spec.states.transitions.find(t => t.name === data.transition)
					res.status(200).json([{
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

	// perform case action
	
	app.post('/api/cases/:id/actions/:action', (req, res) => {
		Case.findById(new ObjectId(hash.decodeHex(req.params.id)))
			.populate("model")
			.exec((err, data) => {
				if (err) throw err;

				// verify the action is valid first

				const sm = new StateMachine({
					init: data.state,
					transitions: data.model.spec.states.transitions
				});	
				const transitions = sm.transitions() || [];
				if (!transitions.find(t => t === req.params.action)) {
					res.status(400).json({ error: 'illegal action ' + req.params.action });
					return;
				}

				// then perform transition

				const transition = data.model.spec.states.transitions.find(t => t.name === req.params.action);
				const url = Formatter.formatProcessUrl(data, transition.url);
				const payload = Formatter.formatProcessBody(data, transition.payload);
				Axios.post(url, payload, HTTP_CONFIG)
					.then(() => {
						data.transition = req.params.action;
						data.save(err => {
							if (err) throw err;
							res.status(204).send()});
						})
					.catch(err => res.status(500).json({ error: err.message ? err.message : err }));
			});
	});

	// receive action callback

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

	// cancel action

	app.delete('/api/cases/:id/actions/:action', (req, res) => {
		Case.findById(new ObjectId(hash.decodeHex(req.params.id)))
			.populate("model")
			.exec((err, data) => {
				if (err) throw err;

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