const expect  = require('chai').expect;
const request = require('request');

describe('Action condition', () => {

  var model;
  var caseObject;

  it('find test model', done => {
    request.get('http://localhost:8080/api/models' , (error, response) => {
      expect(response.statusCode).to.equal(200);
      model = JSON.parse(response.body).find(m => m.name === 'Test');
      done();
    });
  });

  it('create case', (done) => {
    const contents = { clientName: 'John Doe', personalId: 'AB123456', loanAmount: 100 };
    request.post({
      uri: 'http://localhost:8080/api/models/' + model.id + '/cases', 
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(contents)
    }, (error, response, body) => {
      expect(response.statusCode).to.equal(201);
      caseObject = JSON.parse(body);
      done();
    });
  });

  it('list actions, no fund check', (done) => {
    request.get('http://localhost:8080/api/cases/' + caseObject.id + '/actions' , (error, response) => {
      expect(response.statusCode).to.equal(200);
      const json = JSON.parse(response.body);
      expect(json.length).to.equal(1);
      expect(json[0].name).to.equal("identification");
      expect(json[0].label).to.equal("identification");
      expect(json[0].from).to.equal("new");
      expect(json[0].to).to.equal("identification");
      done();
    });
  });

})