const expect  = require('chai').expect;
const request = require('request');

describe('Case', () => {

  var model;

  it('find test model', done => {
    request.get('http://localhost:8080/api/models' , (error, response) => {
      expect(response.statusCode).to.equal(200);
      model = JSON.parse(response.body).find(m => m.name === 'Test');
      done();
    });
  });

  it('query cases', (done) => {
    request.get('http://localhost:8080/api/models/' + model.id + '/cases' , (error, response) => {
      expect(response.statusCode).to.equal(200);
      const json = JSON.parse(response.body);
      expect(json.length).to.greaterThan(-1);
      done();
    });
  });

  it('create case, empty', (done) => {
    request.post('http://localhost:8080/api/models/' + model.id + '/cases', (error, response, body) => {
      expect(JSON.parse(body).error).to.equal("should have required property \'clientName\'");
      expect(response.statusCode).to.gte(0);
      done();
    });
  });

  it('create case, missing personalId', (done) => {
    const contents = { clientName: 'John Doe' };
    request.post({
      uri: 'http://localhost:8080/api/models/' + model.id + '/cases', 
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(contents)
    }, (error, response, body) => {
      expect(JSON.parse(body).error).to.equal("should have required property \'personalId\'");
      expect(response.statusCode).to.equal(400);
      done();
    });
  });

  it('create case, missing loanAmount', (done) => {
    const contents = { clientName: 'John Doe', personalId: 'AB123456' };
    request.post({
      uri: 'http://localhost:8080/api/models/' + model.id + '/cases', 
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(contents)
    }, (error, response, body) => {
      expect(JSON.parse(body).error).to.equal("should have required property \'loanAmount\'");
      expect(response.statusCode).to.equal(400);
      done();
    });
  });

  it('create case, valid request', (done) => {
    const contents = { clientName: 'John Doe', personalId: 'AB123456', loanAmount: 1000 };
    request.post({
      uri: 'http://localhost:8080/api/models/' + model.id + '/cases', 
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(contents)
    }, (error, response, body) => {
      expect(response.statusCode).to.equal(200);
      const json = JSON.parse(body);
      expect(json.starred).to.equal(false);
      expect(json.revision).to.equal(1);
      expect(json.createdAt).to.not.null;
      expect(json.data.clientName).to.equal("John Doe");
      expect(json.data.personalId).to.equal("AB123456");
      expect(json.data.loanAmount).to.equal(1000);
      done();
    });
  });

});