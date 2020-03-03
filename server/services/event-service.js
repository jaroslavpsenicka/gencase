const elasticsearch = require('elasticsearch');
const config = require('../config');
const log4js = require('log4js');
const Notification = require('../model/notification');
const ObjectId = require('mongoose').Types.ObjectId;
const Hashids = require('hashids/cjs');

const hash = new Hashids();
const logger = log4js.getLogger('events')
const esclient = new elasticsearch.Client({ host: config.elasticsearch.url });
const mapping = require('./events.mapping');

esclient.indices.exists({
	index: 'events'
}).then(exists => {
	if (!exists) {
		logger.info('events index does not exist, creating one...')
		esclient.indices.create({ 
      index: 'events' 
    }).then(() => {
			esclient.indices.putMapping({ 
        index: 'events', 
        body: mapping 
      })
		})
	}
});

const findEvents = (caseId, eventClass) => {
  return new Promise(function(resolve, reject) {
    return esclient.search({ 
      index: 'events', 
      q: 'case:' + caseId + (eventClass ? ' AND class:' + eventClass : ''), 
      sort: 'createdAt'
    }).then(result => {
      const events = result.hits.hits.map(hit => hit._source);
      resolve(events);
    }).catch(err => reject(err));
  });
} 

const findLastEventByName = (caseId, eventClass, name) => {
  return new Promise(function(resolve, reject) {
    return esclient.search({ 
      index: 'events',
      q: 'case:' + caseId + (eventClass ? ' AND class:' + eventClass : '') + ' AND data.name:' + name,
      size: 1,
      sort: 'createdAt:desc'
    }).then(result => {
      const events = result.hits.hits.map(hit => hit._source);
      resolve(events.length ? events[0] : undefined);
    }).catch(err => reject(err));
  });
}

const createNotification = (theCase, eventType, eventAuthor, data) => {
  return new Promise(function(resolve, reject) {
    if (eventType == 'ACTION_COMPLETED') {
      logger.info(theCase.id, 'generating notification', eventType, 'for', theCase.createdBy);
      const notifId = new ObjectId();	
      Notification.create({ _id: notifId, 
        id: hash.encodeHex(notifId.toHexString()),
        title: data.name + ' completed', 
        subtitle: 'by ' + eventAuthor,
        case: theCase.id,
        model: theCase.model.id,
        aud: theCase.aud,
        createdBy: eventAuthor,
        createdAt: new Date(),
      }).then(() => resolve()).catch(err => reject(err));
    } else resolve();
  });
}

const submitEvent = (theCase, eventType, eventAuthor, data) => {
  logger.info('submitting event', theCase.id, eventType, eventAuthor, data);
  return new Promise(function(resolve, reject) {
    createNotification(theCase, eventType, eventAuthor, data).then(() => {
      esclient.index({ index: 'events', refresh: config.elasticsearch.refresh, body: {
        case: theCase.id,
        class: eventType.substring(0, eventType.indexOf('_')),
        type: eventType,
        createdBy: eventAuthor,
        createdAt: new Date(),
        data: data ? data : {}
      }}).then(() => resolve()).catch(err => reject(err));
    });
  });
}

module.exports = {
  findEvents, findLastEventByName, submitEvent
}