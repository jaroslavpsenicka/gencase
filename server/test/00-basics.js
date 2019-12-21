const mongoose = require('mongoose');
const config = require('../config');
const expect  = require('chai').expect;
const ObjectId = require('mongoose').Types.ObjectId;
const Case = require('../model/case');

describe('Basics', () => {

  it('mongo multiple field query', (done) => {
    mongoose.connect(config.database.url, { useNewUrlParser: true, useUnifiedTopology: true });
    mongoose.set('useFindAndModify', false);
    const mortgage = new ObjectId('000000000001');	
    Case.findOne({ model: mortgage }, (err, data) => {
      mongoose.disconnect();
      expect(data).to.be.not.null;
      done();
    })
  });

});

