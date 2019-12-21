const Event = require('./model/event');
const ObjectId = require('mongoose').Types.ObjectId;
const Hashids = require('hashids/cjs');

const hash = new Hashids();

const findEvents = (caseId, eventClass) => {
  return Event.find({ case: caseId, class: eventClass});
} 

const findLastEvent = (caseId, eventClass, eventData) => {
  const sorting = { sort: { createdAt: -1 }};
  return Event.findOne({ case: caseId, class: eventClass, data: eventData }, null, sorting);
} 

const submitEvent = (caseId, eventType, eventAuthor, data) => {
  const eventId = new ObjectId();	
  return Event.create({ _id: eventId, 
    id: hash.encodeHex(eventId.toHexString()),  
    case: caseId,
    class: eventType.substring(0, eventType.indexOf('_')),
    type: eventType,
    createdBy: eventAuthor,
    createdAt: new Date(),
    data: data ? data : {}
  });
}

module.exports = {
  findEvents, findLastEvent, submitEvent
}