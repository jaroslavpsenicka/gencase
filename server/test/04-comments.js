const expect  = require('chai').expect;
const request = require('request');

describe('Comments', () => {

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
      expect(response.statusCode).to.equal(201);
      caseObject = JSON.parse(body);
      done();
    });
  });

  it('post a comment', (done) => {
    request.post({
      uri: 'http://localhost:8080/api/cases/' + caseObject.id + '/comments',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ title: 'Comment', text: 'Text' })
    }, (error, response) => {
      expect(response.statusCode).to.equal(201);
      done();
    });
  });

  it('get it back', (done) => {
    request.get('http://localhost:8080/api/cases/' + caseObject.id + '/comments', (error, response) => {
      expect(response.statusCode).to.equal(200);
      const json = JSON.parse(response.body);
      expect(json.length).to.equal(1);
      expect(json[0].title).to.equal("Comment");
      expect(json[0].text).to.equal("Text");
      expect(json[0].case).to.be.undefined;
      done();
    });
  });

  it('illegal case', (done) => {
    request.post({
      uri: 'http://localhost:8080/api/cases/illegal/comments', 
      headers: { "Content-Type": "application/json" },
      contents: "{}"
    }, (error, response) => {
      expect(response.statusCode).to.equal(404);
      expect(JSON.parse(response.body).error).to.equal('case not found');
      done();
    })
  });

  it('non existing case', (done) => {
    request.post({
      uri: 'http://localhost:8080/api/cases/QlXO2YZ2KzTVY141lJQ0/comments', 
      headers: { "Content-Type": "application/json" },
      contents: "{}"
    }, (error, response) => {
      expect(response.statusCode).to.equal(404);
      expect(JSON.parse(response.body).error).to.equal('case not found');
      done();
    })
  });

})