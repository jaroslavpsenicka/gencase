import React, { useState, createContext, useEffect } from 'react';
import { byId } from './ContextUtils';
import Axios from 'axios';

const PAGE_SIZE = 20;
const LOAD_INTERVAL = 10000;
const SERVICE_URL = process.env.REACT_APP_SERVICE_URL || '';
const NotificationsContext = createContext([{}, () => {}]);

const NotificationsProvider = (props) => {

  const [ loadTime, setLoadTime ] = useState(0);
  const [ notifications, setNotifications ] = useState({ loading: true });
  const [ page, setPage ] = useState(0);
  const [ hasNextPage, setHasNextPage ] = useState(false);

  const loadNotifications = () => {
    setNotifications(prev => { return { ...prev, loading: true }});
    Axios.get(SERVICE_URL + '/api/notifications?page=' + page)
      .then(response => setData(notifications.data, response.data))
      .catch(err => setNotifications({ loading: false, error: err }))
  }

  const setData = (prev, data) => {
    const adata = (page > 0) ? [...prev, ...data] : data;
    setHasNextPage(data.length == PAGE_SIZE);
    setNotifications({ loading: false, data: adata, byId: byId(adata) });
  }

  const hasNext = () => {
    return hasNextPage;
  }

  const next = () => {
    setPage(page + 1);
    setHasNextPage(false);
    setLoadTime(Date.now());
  }

  useEffect(() => {
    loadNotifications();
    setTimeout(() => { setLoadTime(Date.now()) }, LOAD_INTERVAL);
  }, [loadTime]);

  return (
    <NotificationsContext.Provider value={{notifications, setNotifications, hasNext, next}}>
      {props.children}
    </NotificationsContext.Provider>
  );
}

export { NotificationsContext, NotificationsProvider };