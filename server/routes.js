const Hashids = require('hashids/cjs');
const multer = require('multer');
const Handlebars = require('handlebars');
const HandlebarsDateFormat = require('handlebars-dateformat')
const ObjectId = require('mongoose').Types.ObjectId; 
const Model = require('./model/model');
const Case = require('./model/case');
const Document = require('./model/document');
const Comment = require('./model/comment');

const hash = new Hashids();
const upload = multer({ storage: multer.memoryStorage() });

const mortgage = new ObjectId('000000000001');	
const loan = new ObjectId('000000000002');	
const test = new ObjectId('000000000003');	

console.log("Creating test models");
Model.deleteMany({}, (err) => {	
	if (err) throw err;
	Model.create({ _id: mortgage, 
		id: hash.encodeHex(mortgage.toHexString()),  
		name: 'Mortgage', 
		description: 'Simple mortgage case.', 
		revision: 3, 
		starred: true, 
		createdBy: 'John Doe',
		createdAt: new Date(),
		spec: {
//			nameFormat: "",
//			descriptionFormat: 'Ahoj {{description}}',
			detailFormat: [{
				id: 'created',
				name: 'Created',
				value: '{{dateFormat createdAt "DD. MM YYYY"}} by {{createdBy}}' 
			}]
		}
	});	
	Model.create({ _id: loan, 
		id: hash.encodeHex(loan.toHexString()),  
		name: 'Loan', 
		description: 'Customer loan as we love it.', 
		revision: 1, 
		starred: true, 
		createdBy: 'Mary Doe',
		spec: {} 
	});	
	Model.create({ _id: test, 
		id: hash.encodeHex(test.toHexString()),  
		name: 'Test', 
		description: 'A brand new product for the rest of us.', 
		revision: 1, 
		createdBy: 'Jane Doe',
		spec: {} 
	});	
});

console.log("Creating test cases");
Case.deleteMany({}, (err) => {	
	if (err) throw err;
	const case1 = new ObjectId('000000000010');	
	Case.create({ _id: case1, 
		id: hash.encodeHex(case1.toHexString()),  
		name: "John's Mortgage", 
		description: 'Yeah, new house.', 
		revision: 3, 
		starred: false,
		createdBy: 'Mary Doe',
		createdAt: new Date(),
		model: mortgage
	});	
});

console.log("Creating test documents");
Document.deleteMany({}, (err) => {	
	if (err) throw err;
	const doc1 = new ObjectId('000000000100');	
	Document.create({ _id: doc1, 
		id: hash.encodeHex(doc1.toHexString()), 
		name: "Document1.pdf", 
		description: 'Almost genuine.', 
		revision: 1, 
		createdBy: 'Mary Doe',
		createdAt: new Date(),
		case: new ObjectId('000000000010'),
		size: 100283
	})
});

console.log("Creating test comments");
Comment.deleteMany({}, (err) => {	
	if (err) throw err;
	const doc1 = new ObjectId('000000001000');	
	Comment.create({ _id: doc1, 
		id: hash.encodeHex(doc1.toHexString()), 
		title: "Lorem", 
		text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer convallis consequat semper. Suspendisse a dolor quis neque placerat rhoncus. Sed eu risus suscipit, vulputate lorem sit amet, sodales orci. Ut vitae arcu quis enim interdum luctus. Nam sed mauris id ipsum rhoncus mattis in ut augue. Nam vehicula vitae orci at aliquam. In hac habitasse platea dictumst. In hac habitasse platea dictumst. Ut tristique dignissim lacinia. Donec consequat id neque vel pellentesque. Nam ornare nisl eget mi eleifend dignissim. Pellentesque sed mi a quam sagittis interdum sed ac orci.', 
		createdBy: 'Mary Doe',
		createdAt: new Date(),
		case: new ObjectId('000000000010')
	})
});

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

	// upload model

	app.post('/api/models', upload.single("file"), (req, res) => {
		console.log("Uploading model", req.file.originalname);
		const nid = new ObjectId();
		try {
			const payload = JSON.parse(req.file.buffer);
			Model.create({
				_id: nid,
				id: hash.encodeHex(nid.toHexString()), 			
				name: payload.name,
				revision: 1,
				createdAt: new Date(),
				spec: payload
			}, (err, model) => {
				if (err) throw err;
				res.status(201).send(model);
			});
		} catch (err) {
			res.status(400).send('Error processing the file.');
		}
	});

	// get models
	
	app.get('/api/models', (req, res) => {
		console.log("Retrieving models");
		Model.find((err, models) => {
			if (err) throw err;
			res.status(200).send(models);
		});
	});

	// update model
	
	app.put('/api/models/:id', (req, res) => {
		console.log("Updating model", req.params.id, req.body);
		Model.findByIdAndUpdate(hash.decodeHex(req.params.id), {
			...req.body, 
			updatedAt: new Date()
		}, function(err) {
			if (err) throw err;
			res.status(204).send();
		});
	});

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

	// get case documents

	app.get('/api/cases/:id/documents', (req, res) => {
		console.log("Getting documents of case", req.params.id);
		Document.find({ case: new ObjectId(hash.decodeHex(req.params.id))}, (err, data) => {
			if (err) throw err;
			res.status(200).send(data);
		});
	});

	app.get('/api/cases/:id/comments', (req, res) => {
		console.log("Getting comments of case", req.params.id);
		Comment.find({ case: new ObjectId(hash.decodeHex(req.params.id))}, (err, data) => {
			if (err) throw err;
			res.status(200).send(data);
		});
	});

};