const expect  = require('chai').expect;
const request = require('request');

describe('Validations', () => {

  var model;
  var caseObject;

  it('find test model', done => {
    request.get('http://localhost:8080/api/models' , (error, response) => {
      expect(response.statusCode).to.equal(200);
      model = JSON.parse(response.body).find(m => m.name === 'Test');
      done();
    });
  });

  it('create case, min', (done) => {
    const contents = { clientName: 'John Doe', personalId: 'AB123456', loanAmount: 10 };
    request.post({
      uri: 'http://localhost:8080/api/models/' + model.id + '/cases', 
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(contents)
    }, (error, response, body) => {
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(body).error).to.equal('property \'loanAmount\' should be < 100');
      done();
    });
  });

  it('create case, max', (done) => {
    const contents = { clientName: 'John Doe', personalId: 'AB123456', loanAmount: 100000 };
    request.post({
      uri: 'http://localhost:8080/api/models/' + model.id + '/cases', 
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(contents)
    }, (error, response, body) => {
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(body).error).to.equal('property \'loanAmount\' should be > 10000');
      done();
    });
  });

  it('create case', (done) => {
    const contents = { clientName: 'John Doe', personalId: 'AB123456', loanAmount: 1000 };
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

  it('update, min', (done) => {
    const contents = { clientName: 'John Doe', personalId: 'AB123456', loanAmount: 10 };
    request.put({
      uri: 'http://localhost:8080/api/cases/' + caseObject.id, 
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(contents)
    }, (error, response, body) => {
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(body).error).to.equal('property \'loanAmount\' should be < 100');
      done();
    });
  });

  it('update, max', (done) => {
    const contents = { clientName: 'John Doe', personalId: 'AB123456', loanAmount: 100000 };
    request.put({
      uri: 'http://localhost:8080/api/cases/' + caseObject.id, 
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(contents)
    }, (error, response, body) => {
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(body).error).to.equal('property \'loanAmount\' should be > 10000');
      done();
    });
  });

  it('callback, not a boolean', (done) => {
    request.post('http://localhost:8080/api/cases/' + caseObject.id + '/actions/check', (error, response) => {
      expect(response.statusCode).to.equal(204);
      const contents = { result: 'illegal' };
      request.post({
        uri: 'http://localhost:8080/api/cases/' + caseObject.id + '/actions/check/callback', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(contents)
      }, (error, response) => {
        expect(response.statusCode).to.equal(400);
        expect(JSON.parse(response.body).error).to.equal('not a boolean: \'illegal\' in field \'moneyCheckStatus\'');
        done();
      });
    });
  });

})