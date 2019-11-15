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

module.exports = function (app) {

	require('./routes/cases.js')(app);
	require('./routes/models.js')(app);
	require('./routes/documents.js')(app);
	require('./routes/comments.js')(app);
	
}	
