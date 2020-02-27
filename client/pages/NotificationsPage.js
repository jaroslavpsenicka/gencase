import React, { useState, useContext, useRef } from 'react';
import axios from 'axios'
import { faStar, faPlus } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarOutline } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from 'react-bootstrap/Button';
import { navigate } from 'hookrouter';
import VagueTime from 'vague-time';
import styled from 'styled-components';

import Loading from '../components/Loading';
import LoadingError from '../components/LoadingError';
import { NotificationsContext } from '../NotificationsContext';

const SERVICE_URL = process.env.REACT_APP_SERVICE_URL || '';

const NextButton = styled(Button)`
  margin: 20px auto;
`

const NotificationsPage = () => {

  const { notifications, setNotifications, hasNext, next } = useContext(NotificationsContext);
  const [ filter, setFilter ] = useState({ unseen: false });

  const toggleSeen = (notification) => {
    if (notification.seen) {
      navigate('/cases/' + notification.model + '/' + notification.case);
    } else {
      axios.put(SERVICE_URL + '/api/notifications/' + notification.id, { seen: !notification.seen })
      .then(() => {
        setNotifications(prev => { return { ...prev, data: updateData(prev, notification)} });
        navigate('/cases/' + notification.model + '/' + notification.case);
      });
    }
  }

  const updateData = (prev, notification) => {
    return prev.data.map(n => {
      return n.id === notification.id ? {...n, seen: true} : n 
    })
  }

  const compareByCreated = (a, b) => {
    return ((a.createdAt > b.createdAt) ? -1 : 1);
  }

  const compareBySeenAndCreated = (a, b) => {
    return (a.seen > b.seen) ? 1 : (a.seen < b.seen) ? -1 : compareByCreated(a, b);
  }

  const Notifications = () => {
    const filtered = notifications.data
      .filter(m => filter.unseen ? !m.seen : true)
      .sort((a, b) => compareBySeenAndCreated(a, b))
      .filter((n, idx) => idx < 50)
      .map(m => <Notification notification={m} key={m.id} />);
    return (notifications.data.length == 0) ? <NoNotifications /> :
      <div> 
        {filtered}
        <div className="d-block text-center">
          { hasNext() ? <NextButton onClick={next}>Show more...</NextButton> : <div/> }
        </div>
      </div>
  }

  const NoNotifications = () => (
    <div className="mt-5 text-center text-secondary">No, there is nothing like this.</div>
  );

  const Notification = ({ notification }) => (
    <div className="p-1 pl-3 bg-white text-dark cursor-pointer" onClick={() => toggleSeen(notification)}>
      <FontAwesomeIcon icon={notification.seen ? faStarOutline : faStar} size="sm"
      className={notification.seen ? 'text-secondary float-left mt-1 mr-3' : 'text-success float-left mt-1 mr-3'}/>
      <div className="text-primary d-inline text-ellipsis pr-3 mr-5">Task {notification.title}</div>
      <div className="text-secondary d-inline float-right pr-2">
        { VagueTime.get({to: new Date(notification.createdAt)}) } { notification.subtitle ? notification.subtitle : '' }
      </div>
    </div>
  )

  return (  
    <div className="p-4">
      <h4 className="w-100 text-muted font-weight-light text-uppercase mb-4 mr-3">
        <FontAwesomeIcon icon={filter.unseen ? faStar : faStarOutline} 
          className="float-right cursor-pointer"
          onClick={() => setFilter({ ...filter, unseen: !filter.unseen })} />
        Notifications
      </h4>
      { 
        notifications.loading ? <Loading /> : 
        notifications.error ? <LoadingError error={notifications.error}/> :  
        notifications.data ? <Notifications /> : 
        <div>No notifications</div>
      }
    </div>
  )
};

export default NotificationsPage;
