import React, { useState, createContext, useEffect } from 'react';
import { byId } from './ContextUtils';
import Axios from 'axios';

const LOAD_INTERVAL = 5000;
const SERVICE_URL = process.env.REACT_APP_SERVICE_URL || '';
const NotificationsContext = createContext([{}, () => {}]);

const NotificationsProvider = (props) => {

  const [loadTime, setLoadTime] = useState(0);
  const [notifications, setNotifications] = useState({ loading: true });

  const loadNotifications = () => {
    setNotifications(prev => { return { ...prev, loading: true }});
    Axios.get(SERVICE_URL + '/api/notifications')
      .then(response => setNotifications({ 
        loading: false, 
        data: response.data, 
        byId: byId(response.data) }))
      .catch(err => setNotifications({ loading: false, error: err }))
  }

  useEffect(() => {
    loadNotifications();
    setTimeout(() => { setLoadTime(Date.now()) }, LOAD_INTERVAL);
  }, [loadTime]);

  return (
    <NotificationsContext.Provider value={[loadTime, notifications, setNotifications]}>
      {props.children}
    </NotificationsContext.Provider>
  );
}

export { NotificationsContext, NotificationsProvider };