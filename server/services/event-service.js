const elasticsearch = require('elasticsearch');
const config = require('../config');
const log4js = require('log4js');

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

const submitEvent = (caseId, eventType, eventAuthor, data) => {
  return esclient.index({ index: 'events', refresh: config.elasticsearch.refresh, body: {
    case: caseId,
    class: eventType.substring(0, eventType.indexOf('_')),
    type: eventType,
    createdBy: eventAuthor,
    createdAt: new Date(),
    data: data ? data : {}
  }});
}

module.exports = {
  findEvents, findLastEventByName, submitEvent
}