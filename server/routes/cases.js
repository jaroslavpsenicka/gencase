const Hashids = require('hashids/cjs');
const Handlebars = require('handlebars');
const HandlebarsDateFormat = require('handlebars-dateformat')
const ObjectId = require('mongoose').Types.ObjectId; 
const Case = require('../model/case');

const hash = new Hashids();

Handlebars.registerHelper('dateFormat', HandlebarsDateFormat);

const formatCaseListData = (data, model) => {
	return {
		id: data.id,
		name: model.nameFormat ? formatValue(model.nameFormat, data) : data.name,
		description: model.descriptionFormat ? formatValue(model.descriptionFormat, data) : data.name,
		revision: data.revision,
		createdBy: data.createdBy,
		createdAt: data.createdAt,
		starred: data.starred
	}
}

const formatCaseDetailData = (data, model) => {
	return model.detailFormat.map(f => {
		return {
			id: f.name,
			name: f.name,
			value: f.value && f.value.indexOf('{{') > -1 ? 
				Handlebars.compile(f.value)(data) : 
				data[f.value]
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
				res.status(200).send(data.map(m => formatCaseListData(m, m.model.spec)));
			});
	});

	// get case data

	app.get('/api/cases/:id', (req, res) => {
		console.log("Getting case", req.params.id);
		Case.findById(new ObjectId(hash.decodeHex(req.params.id)), (err, data) => {
			if (err) throw err;
			res.status(200).send(data);
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

	app.get('/api/cases/:id/detail', (req, res) => {
		console.log("Getting overview of case", req.params.id);
		Case.findById(new ObjectId(hash.decodeHex(req.params.id)))
			.populate("model")
			.exec((err, data) => {
				if (err) throw err;
				res.status(200).send(formatCaseDetailData(data, data.model.spec));
			});
	});

};