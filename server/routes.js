const Hashids = require('hashids/cjs');
const ObjectId = require('mongoose').Types.ObjectId; 
const Model = require('./model/model');
const Case = require('./model/case');
const Document = require('./model/document');
const Comment = require('./model/comment');
const swagger = require('express-swagger-generator');
const config = require('./config');

const hash = new Hashids();

const mortgage = new ObjectId('000000000001');	
const loan = new ObjectId('000000000002');	
const test = new ObjectId('000000000003');	

const loanSpec = require('./data/loan.spec.js');

Model.deleteMany({}, (err) => {	
	if (err) throw err;
	Model.create({ _id: mortgage, 
		id: hash.encodeHex(mortgage.toHexString()),  
		name: 'Loan', 
		description: 'Simple loan case.', 
		revision: 3, 
		starred: true, 
		createdBy: 'John Doe',
		createdAt: new Date(),
		spec: loanSpec
	});	
	Model.create({ _id: loan, 
		id: hash.encodeHex(loan.toHexString()),  
		name: 'Mortgage', 
		description: 'Customer mortgage as we love it.', 
		revision: 1, 
		starred: true, 
		createdBy: 'Mary Doe',
		spec: {
			phases: [],
			entities: []
		} 
	});	
});

Case.deleteMany({}, (err) => {	
	if (err) throw err;
	const case1 = new ObjectId('000000000010');	
	Case.create({ _id: case1, 
		id: hash.encodeHex(case1.toHexString()),  
		name: "Case " + case1, 
		revision: 3, 
		starred: false,
		state: 'new',
		transition: 'toIdentification',
		createdBy: 'Mary Doe',
		createdAt: new Date(),
		model: mortgage,
		data: new Map([
			['clientName', 'Jean-Luc Picard'],
			['personalId', 'AB123456'],
			['loanAmount', 50000]
		])
	});	
});

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

Comment.deleteMany({}, (err) => {	
	if (err) throw err;
	const doc1 = new ObjectId('000000001000');	
	Comment.create({ _id: doc1, 
		id: hash.encodeHex(doc1.toHexString()), 
		title: "Lorem", 
		text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer convallis consequat semper. Suspendisse a dolor quis neque placerat rhoncus. Sed eu risus suscipit, vulputate lorem sit amet, sodales orci. Ut vitae arcu quis enim interdum luctus. Nam sed mauris id ipsum rhoncus mattis in ut augue. Nam vehicula vitae orci at aliquam.', 
		createdBy: 'Mary Doe',
		createdAt: new Date(),
		case: new ObjectId('000000000010')
	})
});

/** 
 * @typedef Error
 * @property {string} error - error description
 */
module.exports = function (app) {

	require('./routes/cases.js')(app);
	require('./routes/models.js')(app);
	require('./routes/documents.js')(app);
	require('./routes/comments.js')(app);

	swagger(app)(config.swagger);

	app.get('/swagger.json', (err, res) => {
    res.status(200).json(swagger.json());
	})

}	
