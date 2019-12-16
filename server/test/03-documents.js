const expect  = require('chai').expect;
const request = require('request');

const file = (caseId, value) => {
  return {
    url: 'http://localhost:8080/api/cases/' + caseId + '/documents', 
    formData: {
      file: {
        value: JSON.stringify(value),
        options: {
          filename: 'file.json',
          contentType: 'application/json'
        }
      }
    }
  }
}

describe('Documents', () => {

  var model;
  var caseObject;

  it('find test model', done => {
    request.get('http://localhost:8080/api/models' , (error, response) => {
      expect(response.statusCode).to.equal(200);
      model = JSON.parse(response.body).find(m => m.name === 'Test');
      done();
    });
  });

  it('prepare case', (done) => {
    const contents = { clientName: 'John Doe', personalId: 'AB123456', loanAmount: 1000 };
    request.post({
      uri: 'http://localhost:8080/api/models/' + model.id + '/cases', 
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(contents)
    }, (error, response, body) => {
      expect(response.statusCode).to.equal(200);
      caseObject = JSON.parse(body);
      done();
    });
  });

  it('upload document', (done) => {
    request.post(file(caseObject.id, {}), (error, response) => {
      expect(response.statusCode).to.equal(201);
      const json = JSON.parse(response.body);
      expect(json.name).to.equal("file.json");
      expect(json.revision).to.equal(1);
      expect(json.size).to.equal(2);
      expect(json.contents).to.be.undefined;
      expect(json.case).to.be.undefined;
      done();
    });
  });

  it('get it back', (done) => {
    request.get('http://localhost:8080/api/cases/' + caseObject.id + '/documents', (error, response) => {
      expect(response.statusCode).to.equal(200);
      const json = JSON.parse(response.body);
      expect(json.length).to.equal(1);
      expect(json[0].name).to.equal("file.json");
      expect(json[0].revision).to.equal(1);
      expect(json[0].size).to.equal(2);
      expect(json[0].contents).to.be.undefined;
      expect(json[0].case).to.be.undefined;
      done();
    });
  });

  it('illegal case', (done) => {
    request.post({
      uri: 'http://localhost:8080/api/cases/illegal/documents', 
      headers: { "Content-Type": "application/json" },
      contents: ""
    }, (error, response) => {
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.body).error).to.equal('argument not valid');
      done();
    })
  });

  it('non existing case', (done) => {
    request.post({
      uri: 'http://localhost:8080/api/cases/QlXO2YZ2KzTVY141lJQ0/documents', 
      headers: { "Content-Type": "application/json" },
      contents: ""
    }, (error, response) => {
      expect(response.statusCode).to.equal(404);
      expect(JSON.parse(response.body).error).to.equal('case not found: QlXO2YZ2KzTVY141lJQ0');
      done();
    })
  });
  
})