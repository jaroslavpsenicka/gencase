const expect  = require('chai').expect;
const request = require('request');

describe('Events', () => {

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

  it('start action, check event', (done) => {
    request.post('http://localhost:8080/api/cases/' + caseObject.id + '/actions/check', (error, response) => {
      expect(response.statusCode).to.equal(204);
      request.get('http://localhost:8080/api/cases/' + caseObject.id + '/events', (error, response) => {
        expect(response.statusCode).to.equal(200);
        const json = JSON.parse(response.body);
        expect(json.length).to.equal(1);
        expect(json[0].class).to.equal('ACTION');
        expect(json[0].type).to.equal('ACTION_STARTED');
        expect(json[0].data).to.eql({ name: 'check' });
        done();
      });
    });
  });

  it('cancel, check event', (done) => {
    request.delete('http://localhost:8080/api/cases/' + caseObject.id + '/actions/check', (error, response) => {
      expect(response.statusCode).to.equal(204);
      request.get('http://localhost:8080/api/cases/' + caseObject.id + '/events', (error, response) => {
        expect(response.statusCode).to.equal(200);
        const json = JSON.parse(response.body);
        expect(json.length).to.equal(2);
        expect(json[0].class).to.equal('ACTION');
        expect(json[0].type).to.equal('ACTION_STARTED');
        expect(json[0].data).to.eql({ name: 'check' });
        expect(json[1].class).to.equal('ACTION');
        expect(json[1].type).to.equal('ACTION_CANCELLED');
        expect(json[1].data).to.eql({ name: 'check' });
        done();
      });
    });
  });

  it('start again and complete', (done) => {
    const contents = { result: true };
    request.post('http://localhost:8080/api/cases/' + caseObject.id + '/actions/check', (error, response) => {
      expect(response.statusCode).to.equal(204);
      request.post({
        uri: 'http://localhost:8080/api/cases/' + caseObject.id + '/actions/check/callback', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(contents)
      }, (error, response) => {
        expect(response.statusCode).to.equal(204);    
        request.get('http://localhost:8080/api/cases/' + caseObject.id + '/events', (error, response) => {
          expect(response.statusCode).to.equal(200);
          const json = JSON.parse(response.body);
          expect(json.length).to.equal(4);
          expect(json[3].class).to.equal('ACTION');
          expect(json[3].type).to.equal('ACTION_COMPLETED');
          expect(json[3].data).to.eql({ name: 'check' });
          done();
        });
      });
    });
  });

  it('try to cancel completed', (done) => {
    request.get('http://localhost:8080/api/cases/' + caseObject.id + '/events', (error, response) => {
      expect(response.statusCode).to.equal(200);
      const json = JSON.parse(response.body);
      expect(json.length).to.equal(4);
      request.delete('http://localhost:8080/api/cases/' + caseObject.id + '/actions/check', (error, response) => {
        expect(response.statusCode).to.equal(400);
        request.get('http://localhost:8080/api/cases/' + caseObject.id + '/events', (error, response) => {
          expect(response.statusCode).to.equal(200);
          const json = JSON.parse(response.body);
          expect(json.length).to.equal(4);
          done();
        });
      });
    });
  });

  it('start/complete identification', (done) => {
    const contents = { result: 1 };
    request.post('http://localhost:8080/api/cases/' + caseObject.id + '/actions/identification', (error, response) => {
      expect(response.statusCode).to.equal(204);
      request.post('http://localhost:8080/api/cases/' + caseObject.id + '/actions/identification/callback', (error, response) => {
        expect(response.statusCode).to.equal(204);
        done();
      });
    });
  });

  it('check actions', (done) => {
    request.get('http://localhost:8080/api/cases/' + caseObject.id + '/actions', (error, response) => {
      expect(response.statusCode).to.equal(200);
      const json = JSON.parse(response.body);
      expect(json.length).to.equal(1);
      expect(json[0].name).to.equal("toBasicApproval");
      done();
    });
  });

})