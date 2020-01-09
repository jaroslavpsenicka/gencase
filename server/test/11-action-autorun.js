const expect  = require('chai').expect;
const request = require('request');

describe('Action autorun', () => {

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
    const contents = { clientName: 'John Doe', personalId: 'AB123456', loanAmount: 6000 };
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

  it('and make sure the auto action is executed', (done) => {
    request.get('http://localhost:8080/api/cases/' + caseObject.id + '/events', (error, response) => {
      expect(response.statusCode).to.equal(200);
      const json = JSON.parse(response.body);
      expect(json.length).to.equal(1);
      expect(json[0].class).to.equal('ACTION');
      expect(json[0].type).to.equal('ACTION_STARTED');
      expect(json[0].data).to.eql({ name: 'notify-deal' });
      done();
    }); 
  });

  it('even after an update', (done) => {
    const contents = { loanAmount: 7000 };
    request.put({
      uri: 'http://localhost:8080/api/cases/' + caseObject.id, 
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(contents)
    }, (error, response, body) => {
      expect(response.statusCode).to.equal(204);
      request.get('http://localhost:8080/api/cases/' + caseObject.id + '/events', (error, response) => {
        expect(response.statusCode).to.equal(200);
        const json = JSON.parse(response.body);
        expect(json.length).to.equal(2);
        expect(json[0].class).to.equal('ACTION');
        expect(json[0].type).to.equal('ACTION_STARTED');
        expect(json[0].data).to.eql({ name: 'notify-deal' });
        expect(json[1].class).to.equal('ACTION');
        expect(json[1].type).to.equal('ACTION_STARTED');
        expect(json[1].data).to.eql({ name: 'notify-deal' });
        done();
      }); 
    });
  });

  it('create case not matching the condition', (done) => {
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

  it('then the auto action is not executed', (done) => {
    request.get('http://localhost:8080/api/cases/' + caseObject.id + '/events', (error, response) => {
      expect(response.statusCode).to.equal(200);
      const json = JSON.parse(response.body);
      expect(json).to.eql([]);
      done();
    }); 
  });

})