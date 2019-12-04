const Hashids = require('hashids/cjs');
const Handlebars = require('handlebars');
const HandlebarsDateFormat = require('handlebars-dateformat')
const ObjectId = require('mongoose').Types.ObjectId;
const Case = require('../model/case');
const Model = require('../model/model');
const StateMachine = require('javascript-state-machine');

const hash = new Hashids();

Handlebars.registerHelper('dateFormat', HandlebarsDateFormat);

const toObject = (map) => {
	const obj = {};
	map.forEach ((v,k) => { obj[k] = v });
	return obj;
}

const toArray = (obj) => {
	const arr = [];
	Object.keys(obj).forEach(k => arr[k] = obj[k]);
	return arr;
}

const formatCaseList = (caseObject, model) => {
	return {
		...caseObject._doc,
		name: model.nameFormat ? formatValue(model.nameFormat, caseObject) : caseObject.name,
		description: model.descriptionFormat ? formatValue(model.descriptionFormat, caseObject) : caseObject.description
	}
}

const formatCase = (caseObject, model) => {
	return {
		...formatCaseList(caseObject, model),
		detail: model.detailFormat ? formatCaseDetail(caseObject, model) : toArray(toObject(caseObject.data))
	}
}

const formatCaseOverview = (caseObject, model) => {
	return model.overviewFormat.map(f => {
		return {
			name: f.name,
			value: f.value && f.value.indexOf('{{') > -1 ? 
				Handlebars.compile(f.value)({...caseObject._doc, data: toObject(caseObject.data)}) : 
				caseObject[f.value]
		}
	});
}

const formatCaseDetail = (caseObject, model) => {
	return model.detailFormat.map(f => {
		return {
			name: f.name,
			value: f.value && f.value.indexOf('{{') > -1 ? 
				Handlebars.compile(f.value)({...caseObject._doc, data: toObject(caseObject.data)}) : 
				caseObject[f.value]
		}
	});
}

const formatValue = (format, caseObject) => {
	return Handlebars.compile(format)({...caseObject._doc, data: toObject(caseObject.data)});
}

module.exports = function (app) {

	// get cases	
	
	app.get('/api/models/:id/cases', (req, res) => {
		console.log("Querying cases of", req.params.id);
		Case.find({model: new ObjectId(hash.decodeHex(req.params.id))})
			.populate("model")
			.exec((err, data) => {
				if (err) throw err;
				res.status(200).send(data.map(m => formatCaseList(m, m.model.spec)));
			});
	});

	// create a new case

	app.post('/api/models/:id/cases', (req, res) => {
		console.log("Create case of", req.params.id);
		Model.findById(new ObjectId(hash.decodeHex(req.params.id)), (err, model) => {
			if (err) throw err;
			const data = new Map([]);

			try {

				const initialPhase = model.spec.phases.find(p => p.initial);			
				if (!initialPhase) throw "no initial phase defined for " + model.name;
			
				const entity = model.spec.entities.find(e => e.name == initialPhase.dataModel);
				if (!entity) throw "entity '" + initialPhase.dataModel + "' not defined"

				const requiredAttributes = entity.attributes.filter(a => a.notEmpty);
				requiredAttributes.forEach(a => {
					const value = req.body[a.name];
					if (value) data.set(a.name, value);	
					else throw "required attribute '" + a.name + "' not given";
				});

			} catch (error) {
				return res.status(400).json({
					error: error
				});
			} 

			const caseId = new ObjectId();	
			console.log('Creating case', caseId, data);
			Case.create({ _id: caseId, 
				id: hash.encodeHex(caseId.toHexString()),  
				name: "Case " + caseId, 
				revision: 1, 
				starred: false,
				createdBy: 'Mary Doe',
				createdAt: new Date(),
				model: model._id,
				data: data
			}, (err, data) => {
				if (err) throw err;
				res.status(200).send(data);
			});	
		
		});
	});

	// get case data

	app.get('/api/cases/:id', (req, res) => {
		console.log("Getting case", req.params.id);
		Case.findById(new ObjectId(hash.decodeHex(req.params.id)))
			.populate("model")
			.exec((err, data) => {
				if (err) throw err;
				res.status(200).send(formatCase(data, data.model.spec));
			});
	});

	// update case

	app.put('/api/cases/:id', (req, res) => {
		console.log("Updating case", req.params.id, req.body);
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
		console.log("Getting overview of case", req.params.id);
		Case.findById(new ObjectId(hash.decodeHex(req.params.id)))
			.populate("model")
			.exec((err, data) => {
				if (err) throw err;
				res.status(200).send(formatCaseOverview(data, data.model.spec));
			});
	});

	// get case actions
	
	app.get('/api/cases/:id/actions', (req, res) => {
		console.log("Getting actions of case", req.params.id);
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
		console.log("Performing action", req.params.action, 'on case', req.params.id);
		Case.findById(new ObjectId(hash.decodeHex(req.params.id)))
			.populate("model")
			.exec((err, data) => {
				if (err) throw err;

				// verify the action is valid first, then perform transition

				const sm = new StateMachine({
					init: data.state,
					transitions: data.model.spec.states.transitions
				});	
				const transitions = sm.transitions() || [];
				if (!transitions.find(t => t === req.params.action)) {
					res.status(400).json({ error: 'illegal action ' + req.params.action });
				}

				data.transition = req.params.action;
				data.save();
				res.status(204).send();
			});
	});

	// cancel transition

	app.delete('/api/cases/:id/transitions/:transition', (req, res) => {
		console.log("Cancelling transition", req.params.transition, 'on case', req.params.id);
		Case.findById(new ObjectId(hash.decodeHex(req.params.id)))
			.populate("model")
			.exec((err, data) => {
				if (err) throw err;

					// verify the transition is valid first, then reset the transition

				const sm = new StateMachine({
					init: data.state,
					transitions: data.model.spec.states.transitions
				});	
				const transitions = sm.transitions() || [];
				if (!transitions.find(t => t === req.params.transition)) {
					res.status(400).json({ error: 'illegal transition ' + req.params.transition });
				}
			
				data.transition = undefined;
				data.save();
				res.status(204).send();
			});
	});

}