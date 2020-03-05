import React, { useRef } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import VagueTime from 'vague-time';

import Loading from '../components/Loading';
import LoadingError from '../components/LoadingError'

const vagueTime = (time) => {
  return VagueTime.get({to: new Date(time)})
}

const eventName = (eventName) => {
  return eventName.split('_')[1].toLowerCase();
}

const eventClass = (eventClass) => {
  return eventClass.toLowerCase();
}

const Events = ({events, eventsRef}) => {

  const EventRow = ({event}) => (
    <Row className="px-2 mb-0 text-dark">
      <Col md={1} className="pl-2 text-primary">{ eventClass(event.class) }</Col>
      <Col md={7} className="pl-2 text-primary">{event.data.name} { eventName(event.type) }</Col>
      <Col md={4} className="text-secondary text-right text-ellipsis pr-2">{vagueTime(event.createdAt)} by {event.createdBy}</Col>
    </Row>
  )

  const NoEvents = () => (
    <div className="text-center text-secondary">No events.</div>
  )

  return (
    <div>
      <h5 className="pt-4" ref={eventsRef}>Events</h5>
      <div className="px-3 py-2 bg-white">
        {
          events.loading ? <Loading /> : 
          events.error ? <LoadingError error = { events.error }/> :  
          events.data && events.data.size == 0 ? <NoEvents /> :
          events.data ? events.data.map(d => <EventRow event={d} key={d.id}/>) : 
          <div />
        }
      </div>
    </div>  
  ); 

}

export default Events;