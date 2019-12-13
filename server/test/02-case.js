const expect  = require('chai').expect;
const request = require('request');

describe('Case', () => {

  var model;
  var caseObject;

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
      caseObject = JSON.parse(body);
      expect(caseObject.starred).to.equal(false);
      expect(caseObject.revision).to.equal(1);
      expect(caseObject.createdAt).to.not.null;
      expect(caseObject.data.clientName).to.equal("John Doe");
      expect(caseObject.data.personalId).to.equal("AB123456");
      expect(caseObject.data.loanAmount).to.equal(1000);
      done();
    });
  });

  it('update case, starring', (done) => {
    const contents = { starred: true };
    request.put({
      uri: 'http://localhost:8080/api/cases/' + caseObject.id, 
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(contents)
    }, (error, response, body) => {
      expect(response.statusCode).to.equal(204);
      request.get('http://localhost:8080/api/cases/' + caseObject.id, (error, response, body) => {
        expect(response.statusCode).to.equal(200);
        caseObject = JSON.parse(body);
        expect(caseObject.starred).to.equal(true);
        expect(caseObject.revision).to.equal(2);
        done();
      });
    });
  });

  it('update case, non-uptatable field', (done) => {
    const contents = { createdBy: 'John Doe' };
    request.put({
      uri: 'http://localhost:8080/api/cases/' + caseObject.id, 
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(contents)
    }, (error, response, body) => {
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(body).error).to.equal("cannot update property \'createdBy\'");
      done();
    });
  });

  it('update case, unknown field', (done) => {
    const contents = { unknownField: 1 };
    request.put({
      uri: 'http://localhost:8080/api/cases/' + caseObject.id, 
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(contents)
    }, (error, response, body) => {
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(body).error).to.equal("cannot update property \'unknownField\'");
      done();
    });
  });

  it('case overview', (done) => {
    request.get('http://localhost:8080/api/cases/' + caseObject.id + '/overview' , (error, response) => {
      expect(response.statusCode).to.equal(200);
      const json = JSON.parse(response.body);
      expect(json.length).to.equal(2);
      expect(json[0]).to.eql({ name: "Loan amount", value: "1000 CZK" });
      expect(json[1].name).to.equal("Created");
      expect(json[1].value).to.contain("Mary Doe");
      done();
    });
  });

  it('case initial state', (done) => {
    request.get('http://localhost:8080/api/cases/' + caseObject.id, (error, response) => {
      expect(response.statusCode).to.equal(200);
      const json = JSON.parse(response.body);
      expect(json.state).to.equal("new");
      expect(json.transition).to.be.undefined;
      done();
    });
  });

  it('list case actions', (done) => {
    request.get('http://localhost:8080/api/cases/' + caseObject.id + '/actions' , (error, response) => {
      expect(response.statusCode).to.equal(200);
      const json = JSON.parse(response.body);
      expect(json.length).to.equal(1);
      expect(json[0].name).to.equal("toIdentification");
      expect(json[0].label).to.equal("Identify client");
      expect(json[0].from).to.equal("new");
      expect(json[0].to).to.equal("identification");
      done();
    });
  });

  it('perform illegal action', (done) => {
    request.post('http://localhost:8080/api/cases/' + caseObject.id + '/actions/illegal', (error, response) => {
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.body).error).to.equal("illegal action 'illegal'");
      done();
    });
  });

  it('perform valid action', (done) => {
    request.post('http://localhost:8080/api/cases/' + caseObject.id + '/actions/toIdentification', (error, response) => {
      expect(response.statusCode).to.equal(204);
      done();
    });
  });

  it('check performed action', (done) => {
    request.get('http://localhost:8080/api/cases/' + caseObject.id, (error, response) => {
      const json = JSON.parse(response.body);
      expect(response.statusCode).to.equal(200);
      expect(json.state).to.equal("new");
      expect(json.transition).to.equal("toIdentification");
      done();
    });
  });

  it('list case actions again', (done) => {
    request.get('http://localhost:8080/api/cases/' + caseObject.id + '/actions' , (error, response) => {
      expect(response.statusCode).to.equal(200);
      const json = JSON.parse(response.body);
      expect(json.length).to.equal(1);
      expect(json[0]).to.eql({ 
        name: 'toIdentification', 
        label: 'Cancel identification',
        to: 'identification',
        cancel: true });
      done();
    });
  });

  it('cancel the action', (done) => {
    request.delete('http://localhost:8080/api/cases/' + caseObject.id + '/actions/toIdentification', (error, response) => {
      expect(response.statusCode).to.equal(204);
      done();
    });
  });

  it('and make sure it\'s back new', (done) => {
    request.get('http://localhost:8080/api/cases/' + caseObject.id, (error, response) => {
      const json = JSON.parse(response.body);
      expect(response.statusCode).to.equal(200);
      expect(json.state).to.equal("new");
      expect(json.transition).to.be.undefined;
      done();
    });
  });

})