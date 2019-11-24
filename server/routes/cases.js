const Hashids = require('hashids/cjs');
const Handlebars = require('handlebars');
const HandlebarsDateFormat = require('handlebars-dateformat')
const ObjectId = require('mongoose').Types.ObjectId;
const Case = require('../model/case');
const Model = require('../model/model');

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
	const data = toObject(caseObject.data);
	return {
		id: caseObject.id,
		name: model.nameFormat ? formatValue(model.nameFormat, data) : caseObject.name,
		description: model.descriptionFormat ? formatValue(model.descriptionFormat, data) : caseObject.description,
		revision: caseObject.revision,
		createdBy: caseObject.createdBy,
		createdAt: caseObject.createdAt,
		starred: caseObject.starred
	}
}

const formatCase = (caseObject, model) => {
	return {
		...formatCaseList(caseObject, model),
		data: model.detailFormat ? formatCaseDetail(caseObject, model) : toArray(toObject(caseObject.data))
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

const formatValue = (format, value) => {
	return Handlebars.compile(format)(value);
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

};