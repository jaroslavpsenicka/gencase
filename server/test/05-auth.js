const expect  = require('chai').expect;
const request = require('request');

const TEST_JWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJkYXRhY2FzZS5vcmciLCJpYXQiOjE1NzY1MTk5NTAsImV4cCI6MTYwODA1NTk1MCwiYXVkIjoiZG9lLmNvbSIsInN1YiI6ImpvaG5AZG9lLmNvbSJ9.g5NgWO_gya25jXKqjO0qIhtLFKBOdg7Y18HvC077hAk';
const EXPIRED_JWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJkYXRhY2FzZS5vcmciLCJpYXQiOjE1NzY1MzkzMTAsImV4cCI6MTU3NjUzOTMxMSwiYXVkIjoiZG9lLmNvbSIsInN1YiI6ImpvaG5AZG9lLmNvbSJ9.xsgLsTb2nAaCQbLcpPZIXK02XRknPGBI-aC5MqcxdZg';

describe('Auth', () => {

  var model;
  var audCase;

  it('find test model', done => {
    request.get('http://localhost:8080/api/models' , (error, response) => {
      expect(response.statusCode).to.equal(200);
      model = JSON.parse(response.body).find(m => m.name === 'Test');
      expect(model).to.not.null;
      done();
    });
  });

  it('query cases', (done) => {
    request.get({
      uri: 'http://localhost:8080/api/models/' + model.id + '/cases', 
      headers: { Authorization: 'Bearer ' + TEST_JWT }
    }, (error, response) => {
      expect(response.statusCode).to.equal(200);
      const json = JSON.parse(response.body);
      expect(json.length).to.gte(0);
      done();
    });
  });

  it('create case, invalid token', (done) => {
    request.post({
      uri: 'http://localhost:8080/api/models/' + model.id + '/cases', 
      headers: { Authorization: 'Bearer XXX' },
      body: "{}"
    }, (error, response) => {
      expect(response.statusCode).to.equal(403);
      expect(JSON.parse(response.body).error).to.equal("jwt malformed");
      done();
    });
  });

  it('create case, expired token', (done) => {
    request.post({
      uri: 'http://localhost:8080/api/models/' + model.id + '/cases', 
      headers: { Authorization: 'Bearer ' + EXPIRED_JWT },
      body: "{}"
    }, (error, response) => {
      expect(response.statusCode).to.equal(403);
      expect(JSON.parse(response.body).error).to.equal("jwt expired");
      done();
    });
  });

  it('create case, empty', (done) => {
    request.post({
      uri: 'http://localhost:8080/api/models/' + model.id + '/cases', 
      headers: { Authorization: 'Bearer ' + TEST_JWT },
      body: "{}"
    }, (error, response, body) => {
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(body).error).to.equal("should have required property \'clientName\'");
      done();
    });
  });

  it('create case, with aud', (done) => {
    const contents = { clientName: 'John Doe', personalId: 'AB123456', loanAmount: 1000 };
    request.post({
      uri: 'http://localhost:8080/api/models/' + model.id + '/cases', 
      headers: { Authorization: 'Bearer ' + TEST_JWT, 'Content-Type': 'application/json' },
      body: JSON.stringify(contents)
    }, (error, response) => {
      expect(response.statusCode).to.equal(201);
      audCase = JSON.parse(response.body);
      expect(audCase.id).to.be.not.null;
      request.get({
        uri: 'http://localhost:8080/api/models/' + model.id + '/cases', 
        headers: { Authorization: 'Bearer ' + TEST_JWT }
      }, (error, response) => {
        expect(response.statusCode).to.equal(200);
        const json = JSON.parse(response.body);
        expect(json.length).to.gt(0);
        expect(json.find(c => c.id === audCase.id)).to.be.not.null;
        done();
      });
    });
  });

  it('get case metadata as aud user', (done) => {
    request.get({
      uri: 'http://localhost:8080/api/cases/' + audCase.id + '/metadata', 
      headers: { Authorization: 'Bearer ' + TEST_JWT }
    }, (error, response) => {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it('get case metadata as anonymous', (done) => {
    request.get('http://localhost:8080/api/cases/' + audCase.id + '/metadata', (err, response) => {
      expect(response.statusCode).to.equal(404);
      done();
    });
  });

  it('get case data as aud user', (done) => {
    request.get({
      uri: 'http://localhost:8080/api/cases/' + audCase.id, 
      headers: { Authorization: 'Bearer ' + TEST_JWT }
    }, (error, response) => {
      expect(response.statusCode).to.equal(200);
      expect(JSON.parse(response.body)).to.eql({
        clientName: 'John Doe', 
        personalId: 'AB123456', 
        loanAmount: 1000
      });
      done();
    });
  });

  it('get case data as anonymous', (done) => {
    request.get('http://localhost:8080/api/cases/' + audCase.id, (err, response) => {
      expect(response.statusCode).to.equal(404);
      done();
    });
  });

  it('update case data as aud user', (done) => {
    const contents = { clientName: 'Frank Doe' };
    request.put({
      uri: 'http://localhost:8080/api/cases/' + audCase.id, 
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TEST_JWT },
      body: JSON.stringify(contents)
    }, (error, response) => {
      expect(response.statusCode).to.equal(204);
      request.get({
        uri: 'http://localhost:8080/api/cases/' + audCase.id, 
        headers: { Authorization: 'Bearer ' + TEST_JWT }
      }, (error, response) => {
        expect(response.statusCode).to.equal(200);
        expect(JSON.parse(response.body)).to.eql({
          clientName: 'Frank Doe', 
          personalId: 'AB123456', 
          loanAmount: 1000
        });    
        done();
      });
    });
  });

  it('update case data as anonymous', (done) => {
    const contents = { clientName: 'Frank Doe' };
    request.put({
      uri: 'http://localhost:8080/api/cases/' + audCase.id, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contents)
    }, (error, response) => {
      expect(response.statusCode).to.equal(404);
      done();
    });
  });

  it('get case overview as aud user', (done) => {
    request.get({
      uri: 'http://localhost:8080/api/cases/' + audCase.id + '/overview', 
      headers: { Authorization: 'Bearer ' + TEST_JWT }
    }, (error, response) => {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it('get case overview as anonymous', (done) => {
    request.get('http://localhost:8080/api/cases/' + audCase.id + '/overview', (err, response) => {
      expect(response.statusCode).to.equal(404);
      done();
    });
  });

  it('get case actions as aud user', (done) => {
    request.get({
      uri: 'http://localhost:8080/api/cases/' + audCase.id + '/actions', 
      headers: { Authorization: 'Bearer ' + TEST_JWT }
    }, (error, response) => {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it('get case actions as anonymous', (done) => {
    request.get('http://localhost:8080/api/cases/' + audCase.id + '/actions', (err, response) => {
      expect(response.statusCode).to.equal(404);
      done();
    });
  });

  it('execute case action as aud user', (done) => {
    request.post({
      uri: 'http://localhost:8080/api/cases/' + audCase.id + '/actions/toIdentification', 
      headers: { Authorization: 'Bearer ' + TEST_JWT }
    }, (error, response) => {
      expect(response.statusCode).to.equal(204);
      done();
    });
  });

  it('execute case action as anonymous', (done) => {
    request.post('http://localhost:8080/api/cases/' + audCase.id + '/actions', (err, response) => {
      expect(response.statusCode).to.equal(404);
      done();
    });
  });

  it('cancel case action as aud user', (done) => {
    request.delete({
      uri: 'http://localhost:8080/api/cases/' + audCase.id + '/actions/toIdentification', 
      headers: { Authorization: 'Bearer ' + TEST_JWT }
    }, (error, response) => {
      expect(response.statusCode).to.equal(204);
      done();
    });
  });

  it('cancel case action as anonymous', (done) => {
    request.delete('http://localhost:8080/api/cases/' + audCase.id + '/actions', (err, response) => {
      expect(response.statusCode).to.equal(404);
      done();
    });
  });

  it('get case comments as aud user', (done) => {
    request.get({
      uri: 'http://localhost:8080/api/cases/' + audCase.id + '/comments', 
      headers: { Authorization: 'Bearer ' + TEST_JWT }
    }, (error, response) => {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it('get case comments as anonymous', (done) => {
    request.get('http://localhost:8080/api/cases/' + audCase.id + '/comments', (err, response) => {
      expect(response.statusCode).to.equal(404);
      done();
    });
  });

  it('create case comment as aud user', (done) => {
    request.post({
      uri: 'http://localhost:8080/api/cases/' + audCase.id + '/comments', 
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TEST_JWT },
      body: "{}"
    }, (error, response) => {
      expect(response.statusCode).to.equal(201);
      done();
    });
  });

  it('get case comments as anonymous', (done) => {
    request.post({
      uri: 'http://localhost:8080/api/cases/' + audCase.id + '/comments',
      headers: { 'Content-Type': 'application/json' },
      body: "{}"
    }, (err, response) => {
      expect(response.statusCode).to.equal(404);
      done();
    });
  });

})