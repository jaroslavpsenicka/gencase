import React, { useContext } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Image from 'react-bootstrap/Image';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { A, navigate } from 'hookrouter';
import { faBars, faCog } from '@fortawesome/free-solid-svg-icons'
import { faBell } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styled from 'styled-components';
import VagueTime from 'vague-time';
import Axios from 'axios';

import { NotificationsContext } from '../NotificationsContext';

import Loading from './Loading';
import LoadingError from './LoadingError';
import photo from '../static/photo.jpg';

const SERVICE_URL = process.env.REACT_APP_SERVICE_URL || '';

const StyledNavbar = styled(Navbar)`
  border-bottom: 1px solid lightgray;
`
const StyledToogle = styled.div`
  float: left;
  margin-left: 15px;
  margin-right: 25px;
  cursor: pointer;
  font-size: 20px;
  color: gray;
`
const StyledIndicator = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background-color: red;
  width: 10px;
  height: 10px;
  border-radius: 5px;
`
const StyledPopover = styled(Popover)`
  top: 10px !important;
  min-width: 300px !important;
  max-width: 600px !important;
`
const StyledNotification = styled.div`
  cursor: pointer;
`
const StyledNotificationTitle = styled.div`
  font-size: 1.1em;
  font-weight: bold;
`
const StyledNotificationSubtitle = styled.div`
  padding-bottom: 5px;
`

const SettingsIcon = () => (
  <A href="/settings" className="mt-1 ml-4 mr-2">
    <FontAwesomeIcon icon={faCog} size="lg"/>
  </A>
)

const ProfileIcon = () => (
  <A href="/profile" className="ml-4 mr-2">
    <Image src={photo} roundedCircle/>
  </A>  
)

const Header = ({ toggleSidebar }) => {

  const { notifications, setNotifications } = useContext(NotificationsContext);

  const clickHandler = (notification) => {
    Axios.put(SERVICE_URL + '/api/notifications/' + notification.id, { seen: true })
    .then(response => {
      setNotifications(prev => { 
        return { ...prev, data: prev.data.map(n => {
          return n.id === notification.id ? response : n;
        })}
      });
      navigate('/cases/' + notification.model + '/' + notification.case);
    });
  }

  const hasNewNotifications = () => {
    return notifications.data && notifications.data.find(n => !n.seen);
  }
  
  /* 
    show all notifications on separate page 
  */
  const Notification = ({ notification }) => (
    <StyledNotification onClick={() => clickHandler(notification)}>
      <StyledNotificationTitle>
        Task {notification.title}
      </StyledNotificationTitle> 
      <StyledNotificationSubtitle>
        { VagueTime.get({to: new Date(notification.createdAt)}) } { notification.subtitle }
      </StyledNotificationSubtitle>
    </StyledNotification>
  )

  const NotificationsPopover = (
    <StyledPopover>
      <Popover.Content> 
      { 
        hasNewNotifications() ? notifications.data
          .filter(n => !n.seen)
          .sort((a, b) => a.createdAt > b.createdAt)
          .filter((n, idx) => idx < 10)
          .map(n => <Notification key={n.id} notification={n}/>) :
        notifications.loading ? <Loading /> :
        notifications.error ? <LoadingError error={notifications.error}/> :
        <div>No new notifications.</div>
      }
      </Popover.Content>
      <Popover.Title>
        <A href="/notifications">Show all notifications.</A>
      </Popover.Title>
    </StyledPopover>
  );
      
  const BellIcon = () => (
    <A href="" className="mt-1 ml-4 mr-2 position-relative">
      <OverlayTrigger trigger="click" placement="bottom" overlay={NotificationsPopover}>
        <FontAwesomeIcon icon={faBell} size="lg"/>
      </OverlayTrigger>
      { hasNewNotifications() ? <StyledIndicator/> : <div/> }
    </A>
  );

  return (
    <StyledNavbar bg="white" sticky="top">
      <StyledToogle onClick={toggleSidebar}>
        <div className="icon-reorder tooltips" data-original-title="Toggle" data-placement="bottom">
          <FontAwesomeIcon icon={faBars} />
        </div>
      </StyledToogle>      
      <Navbar.Brand href="/cases">DataCase</Navbar.Brand>
      <Nav className="ml-auto">
        <SettingsIcon/>
        <BellIcon/>
        <ProfileIcon/>
      </Nav>
    </StyledNavbar>
  )
}

export default Header;
