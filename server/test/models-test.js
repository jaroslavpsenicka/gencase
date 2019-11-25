const expect  = require('chai').expect;
const request = require('request');

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
    request.post({
      url: 'http://localhost:8080/api/models', 
      formData: {
        file: {
          value: '{}',
          options: {
            filename: 'file.json',
            contentType: 'application/json'
          }
        }
      }
    }, (error, response, body) => {
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(body).error).to.equal("should have required property \'entities\'");
      done();
    });
  });

  it('upload model, no entities', (done) => {
    request.post({
      url: 'http://localhost:8080/api/models', 
      formData: {
        file: {
          value: JSON.stringify({ phases: [] }),
          options: {
            filename: 'file.json',
            contentType: 'application/json'
          }
        }
      }
    }, (error, response, body) => {
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(body).error).to.equal("should have required property \'entities\'");
      done();
    });
  });

  it('upload model, no phases', (done) => {
    request.post({
      url: 'http://localhost:8080/api/models', 
      formData: {
        file: {
          value: JSON.stringify({ entities: [] }),
          options: {
            filename: 'file.json',
            contentType: 'application/json'
          }
        }
      }
    }, (error, response, body) => {
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(body).error).to.equal("should have required property \'phases\'");
      done();
    });
  });

});