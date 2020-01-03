const expect  = require('chai').expect;
const request = require('request');

describe('Response mapping', () => {

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

  it('unknown field', (done) => {
    const contents = { unknown: 1 };
    request.post('http://localhost:8080/api/cases/' + caseObject.id + '/actions/check', (error, response) => {
      expect(response.statusCode).to.equal(204);
      request.post({
        uri: 'http://localhost:8080/api/cases/' + caseObject.id + '/actions/check/callback', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(contents)
      }, (error, response) => {
        expect(response.statusCode).to.equal(400);
        expect(JSON.parse(response.body).error).to.equal('not a boolean: \'\' in field \'moneyCheckStatus\'')
        request.get('http://localhost:8080/api/cases/' + caseObject.id, (error, response) => {
          expect(response.statusCode).to.equal(200);
          const json = JSON.parse(response.body);
          expect(json.moneyCheckStatus).to.be.undefined;
          request.delete('http://localhost:8080/api/cases/' + caseObject.id + '/actions/check', (error, response) => {
            expect(response.statusCode).to.equal(204);
            done();
          });
        });
      });
    });
  });

  it('cancelled action', (done) => {
    const contents = { result: true };
    request.post('http://localhost:8080/api/cases/' + caseObject.id + '/actions/check', (error, response) => {
      expect(response.statusCode).to.equal(204);
      request.delete('http://localhost:8080/api/cases/' + caseObject.id + '/actions/check', (error, response) => {
        expect(response.statusCode).to.equal(204);
        request.post({
          uri: 'http://localhost:8080/api/cases/' + caseObject.id + '/actions/check/callback', 
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(contents)
        }, (error, response) => {
          expect(response.statusCode).to.equal(400);
          expect(JSON.parse(response.body).error).to.equal('illegal action check')
          done();
        });
      });
    });
  });
  
  it('already completed action', (done) => {
    const contents = { result: true };
    request.post('http://localhost:8080/api/cases/' + caseObject.id + '/actions/check', (error, response) => {
      expect(response.statusCode).to.equal(204);
      request.post({
        uri: 'http://localhost:8080/api/cases/' + caseObject.id + '/actions/check/callback', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(contents)
      }, (error, response) => {
        expect(response.statusCode).to.equal(204);
        request.post({
          uri: 'http://localhost:8080/api/cases/' + caseObject.id + '/actions/check/callback', 
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(contents)
        }, (error, response) => {
          expect(response.statusCode).to.equal(400);
          expect(JSON.parse(response.body).error).to.equal('illegal action check')
          done();
        });
      });
    });
  });

  it('type mismatch', (done) => {
    const contents = { result: 'wrong' };
    request.post('http://localhost:8080/api/cases/' + caseObject.id + '/actions/check', (error, response) => {
      expect(response.statusCode).to.equal(204);
      request.post({
        uri: 'http://localhost:8080/api/cases/' + caseObject.id + '/actions/check/callback', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(contents)
      }, (error, response) => {
        expect(response.statusCode).to.equal(400);
        expect(JSON.parse(response.body).error).to.equal('not a boolean: \'wrong\' in field \'moneyCheckStatus\'');
        request.delete('http://localhost:8080/api/cases/' + caseObject.id + '/actions/check', (error, response) => {
          expect(response.statusCode).to.equal(204);
          done();
        });
      });
    });
  });

  it('successful check', (done) => {
    const contents = { result: true };
    request.post('http://localhost:8080/api/cases/' + caseObject.id + '/actions/check', (error, response) => {
      expect(response.statusCode).to.equal(204);
      request.post({
        uri: 'http://localhost:8080/api/cases/' + caseObject.id + '/actions/check/callback', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(contents)
      }, (error, response) => {
        expect(response.statusCode).to.equal(204);
        request.get('http://localhost:8080/api/cases/' + caseObject.id, (error, response) => {
          expect(response.statusCode).to.equal(200);
          const json = JSON.parse(response.body);
          expect(json).to.eql({ clientName: 'John Doe', personalId: 'AB123456', loanAmount: 1000, moneyCheckStatus: 'true' });
          done();
        });
      });
    });
  });

})