const expect  = require('chai').expect;
const request = require('request');
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

  var model = undefined;

  it('query models', (done) => {
    request.get('http://localhost:8080/api/models' , (error, response) => {
      expect(response.statusCode).to.equal(200);
      const json = JSON.parse(response.body);
      expect(json.length).to.equals(3);
      model = json[0];
      done();
    });
  });

  it('update model', (done) => {
    const payload = {...model, name: 'Loan' }
    request.put('http://localhost:8080/api/models/' + model.id , payload, (error, response) => {
      expect(response.statusCode).to.equal(204);
      done();
    });
  });

  it('upload model, empty', (done) => {
    request.post(file({}), (error, response, body) => {
      expect(JSON.parse(body).error).to.equal("should have required property \'entities\'");
      expect(response.statusCode).to.equal(400);
      done();
    });
  });

  it('upload model, no entities', (done) => {
    const contents = { phases: [] };
    request.post(file(contents), (error, response, body) => {
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(body).error).to.equal("should have required property \'entities\'");
      done();
    });
  });

  it('upload model, no phases', (done) => {
    const contents = { entities: [] };
    request.post(file(contents), (error, response, body) => {
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(body).error).to.equal("should have required property \'phases\'");
      done();
    });
  });

  it('upload model, empty entity', (done) => {
    const contents = { phases: [{ name: "P1"}], entities: [{ name: "E1"}] };
    request.post(file(contents), (error, response, body) => {
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(body).error).to.equal("entities[0]: should have required property \'attributes\'");
      done();
    });
  });

  it('upload valid model', (done) => {
    request.post(file(validModel), (error, response, body) => {
      expect(response.statusCode).to.equal(201);
      done();
    });
  });

});