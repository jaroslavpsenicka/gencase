const mongoose = require('mongoose');
const config = require('../config');
const expect  = require('chai').expect;
const ObjectId = require('mongoose').Types.ObjectId;
const Case = require('../model/case');

describe('Basics', () => {

  it('connect', (done) => {
    mongoose.connect(config.database.url, { useNewUrlParser: true, useUnifiedTopology: true });
    mongoose.set('useFindAndModify', false);
    done();
  })

  it('mongo multiple field query', (done) => {
    const mortgage = new ObjectId('000000000001');	
    Case.findOne({ model: mortgage, aud: 'public' }, (err, data) => {
      expect(data).to.be.not.null;
      done();
    })
  });

  it('disconect', (done) => {
    mongoose.disconnect();
    done();
  })

});

