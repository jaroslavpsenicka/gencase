const expect  = require('chai').expect;
const request = require('request');

const TEST_JWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJkYXRhY2FzZS5vcmciLCJpYXQiOjE1NzY1MTk5NTAsImV4cCI6MTYwODA1NTk1MCwiYXVkIjoiZG9lLmNvbSIsInN1YiI6ImpvaG5AZG9lLmNvbSJ9.g5NgWO_gya25jXKqjO0qIhtLFKBOdg7Y18HvC077hAk';

describe('Notifications', () => {

  var model;
  var caseObject;
  var notification;

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
      notification = json.find(e => e.case === caseObject.id)
      expect(notification.title).to.equal('notify-deal completed');
      expect(notification.subtitle).to.equal('by john@doe.com');
      expect(notification.case).to.equal(caseObject.id);
      expect(notification.aud).to.equal('doe.com');
      expect(notification.seen).to.equal(false);
      expect(notification.updatedAt).to.be.undefined;
      expect(notification.updatedBy).to.be.undefined;
      done();
    });
  });

  it('and paging works', (done) => {
    request.get({
      uri: 'http://localhost:8080/api/notifications',
      headers: { Authorization: 'Bearer ' + TEST_JWT }
    }, (error, response) => {
      expect(response.statusCode).to.equal(200);
      const json = JSON.parse(response.body);
      if (json.length > 1) {
        request.get({
          uri: 'http://localhost:8080/api/notifications?page=1&size=1',
          headers: { Authorization: 'Bearer ' + TEST_JWT }
        }, (error, response) => {
          expect(response.statusCode).to.equal(200);
          const json2 = JSON.parse(response.body);
          expect(json2.length).to.equal(1);
          done();
        });
      } else done();
    });
  });

  it('and can be confirmed', (done) => {
    const contents = { seen: true };
    request.put({
      uri: 'http://localhost:8080/api/notifications/' + notification.id,
      headers: { Authorization: 'Bearer ' + TEST_JWT, 'Content-Type': 'application/json' },
      body: JSON.stringify(contents)
    }, (error, response) => {
      expect(response.statusCode).to.equal(200);
      request.get({
        uri: 'http://localhost:8080/api/notifications',
        headers: { Authorization: 'Bearer ' + TEST_JWT }
      }, (error, response) => {
        expect(response.statusCode).to.equal(200);
        const json = JSON.parse(response.body);
        const confirmed = json.find(e => e.case === caseObject.id)
        expect(confirmed.title).to.equal('notify-deal completed');
        expect(confirmed.subtitle).to.equal('by john@doe.com');
        expect(confirmed.case).to.equal(caseObject.id);
        expect(confirmed.model).to.equal(model.id);
        expect(confirmed.aud).to.equal('doe.com');
        expect(confirmed.seen).to.equal(true);
        expect(confirmed.updatedAt).to.not.be.undefined;
        expect(confirmed.updatedBy).to.not.be.undefined;
        done();
      });
    });
  });

  it('valid notifications only', (done) => {
    const contents = { seen: true };
    request.put({
      uri: 'http://localhost:8080/api/notifications/illegal',
      headers: { Authorization: 'Bearer ' + TEST_JWT, 'Content-Type': 'application/json' },
      body: JSON.stringify(contents)
    }, (error, response) => {
      expect(response.statusCode).to.equal(404);
      done();
    });
  });

  it('valid attrbutes only', (done) => {
    const contents = { illegal: true };
    request.put({
      uri: 'http://localhost:8080/api/notifications/' + notification.id,
      headers: { Authorization: 'Bearer ' + TEST_JWT, 'Content-Type': 'application/json' },
      body: JSON.stringify(contents)
    }, (error, response) => {
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.body).error).to.equal('illegal parameter');
      done();
    });
  });

  it('valid users only', (done) => {
    const contents = { seen: true };
    request.put({
      uri: 'http://localhost:8080/api/notifications/' + notification.id,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contents)
    }, (error, response) => {
      expect(response.statusCode).to.equal(404);
      done();
    });
  });

})