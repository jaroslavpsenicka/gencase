const request = require('request');
const expect  = require('chai').expect;
const validModel = require('../data/loan.spec');

const file = (value) => {
  return {
    url: 'http://localhost:8080/api/models', 
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

describe('Model', () => {

  var model;

  it('query models', (done) => {
    request.get('http://localhost:8080/api/models' , (error, response) => {
      expect(response.statusCode).to.equal(200);
      const json = JSON.parse(response.body);
      expect(json.length).to.greaterThan(0);
      model = json[0];
      done();
    });
  });

  it('update model', (done) => {
    const contents = {...model, name: 'Loan' }
    request.put({
      uri: 'http://localhost:8080/api/models/' + model.id, 
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(contents)
    }, (error, response) => {
      expect(response.statusCode).to.equal(204);
      done();
    });
  });

  it('verify updated model', (done) => {
    request.get('http://localhost:8080/api/models/' + model.id, (error, response, body) => {
      const json = JSON.parse(body);
      expect(json._id).to.be.undefined;
      expect(json.__v).to.be.undefined;
      expect(json.name).to.equal("Loan");
      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it('upload model, empty', (done) => {
    request.post(file({}), (error, response, body) => {
      expect(JSON.parse(body).error).to.equal("should have required property \'name\'");
      expect(response.statusCode).to.equal(400);
      done();
    });
  });

  it('upload model, only name', (done) => {
    const contents = { name: "name" };
    request.post(file(contents), (error, response, body) => {
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(body).error).to.equal("should have required property \'entities\'");
      done();
    });
  });

  it('upload model, empty entity', (done) => {
    const contents = { name: "name", phases: [{ name: "P1"}], entities: [{ name: "E1"}] };
    request.post(file(contents), (error, response, body) => {
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(body).error).to.equal("entities[0]: should have required property \'attributes\'");
      done();
    });
  });

  it('upload valid model', (done) => {
    request.post(file(validModel), (error, response, body) => {
      model = JSON.parse(body);
      expect(model).to.not.be.null;
      expect(response.statusCode).to.equal(201);
      done();
    });
  });

  it('get uploaded model', (done) => {
    request.get('http://localhost:8080/api/models/' + model.id, (error, response, body) => {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });

});