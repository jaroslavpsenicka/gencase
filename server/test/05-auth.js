const expect  = require('chai').expect;
const request = require('request');

const TEST_JWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJkYXRhY2FzZS5vcmciLCJpYXQiOjE1NzY1MTk5NTAsImV4cCI6MTYwODA1NTk1MCwiYXVkIjoiZG9lLmNvbSIsInN1YiI6ImpvaG5AZG9lLmNvbSJ9.g5NgWO_gya25jXKqjO0qIhtLFKBOdg7Y18HvC077hAk';
const EXPIRED_JWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJkYXRhY2FzZS5vcmciLCJpYXQiOjE1NzY1MzkzMTAsImV4cCI6MTU3NjUzOTMxMSwiYXVkIjoiZG9lLmNvbSIsInN1YiI6ImpvaG5AZG9lLmNvbSJ9.xsgLsTb2nAaCQbLcpPZIXK02XRknPGBI-aC5MqcxdZg';

describe('Auth', () => {

  var model;

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

})