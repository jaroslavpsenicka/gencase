const expect  = require('chai').expect;
const request = require('request');

const TEST_JWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJkYXRhY2FzZS5vcmciLCJpYXQiOjE1NzY1MTk5NTAsImV4cCI6MTYwODA1NTk1MCwiYXVkIjoiZG9lLmNvbSIsInN1YiI6ImpvaG5AZG9lLmNvbSJ9.g5NgWO_gya25jXKqjO0qIhtLFKBOdg7Y18HvC077hAk';

describe('Notifications', () => {

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
      headers: { Authorization: 'Bearer ' + TEST_JWT, 'Content-Type': 'application/json' },
      body: JSON.stringify(contents)
    }, (error, response, body) => {
      expect(response.statusCode).to.equal(201);
      caseObject = JSON.parse(body);
      setTimeout(() => done(), 100); // wait for the callback
    });
  });

  it('and make sure the auto action is executed', (done) => {
    request.get({
      uri: 'http://localhost:8080/api/cases/' + caseObject.id + '/events', 
      headers: { Authorization: 'Bearer ' + TEST_JWT },
    }, (error, response) => {
      expect(response.statusCode).to.equal(200);
      const json = JSON.parse(response.body);
      expect(json.length).to.equal(2);
      expect(json[0].class).to.equal('ACTION');
      expect(json[0].type).to.equal('ACTION_STARTED');
      expect(json[0].data).to.eql({ name: 'notify-deal' });
      expect(json[1].class).to.equal('ACTION');
      expect(json[1].type).to.equal('ACTION_COMPLETED');
      expect(json[1].data).to.eql({ name: 'notify-deal' });
      done();
    }); 
  });

  it('and notification exists', (done) => {
    request.get({
      uri: 'http://localhost:8080/api/notifications',
      headers: { Authorization: 'Bearer ' + TEST_JWT }
    }, (error, response) => {
      expect(response.statusCode).to.equal(200);
      const json = JSON.parse(response.body);
      expect(json.length).to.gte(1);
      const notification = json.find(e => e.case === caseObject.id)
      expect(notification.title).to.equal('notify-deal completed');
      expect(notification.subtitle).to.equal('by john@doe.com');
      expect(notification.case).to.equal(caseObject.id);
      expect(notification.sub).to.equal('john@doe.com');
      expect(notification.seen).to.equal(false);
      done();
    });
  });

})