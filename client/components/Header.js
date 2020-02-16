import React, { useContext } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Image from 'react-bootstrap/Image';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { A } from 'hookrouter';
import { faBars, faCog } from '@fortawesome/free-solid-svg-icons'
import { faBell } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styled from 'styled-components';
import { NotificationsContext } from '../NotificationsContext';

import Loading from './Loading';
import LoadingError from './LoadingError';

import photo from '../static/photo.jpg';

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

const hasNewNotifications = (notifications) => {
  return notifications.data && notifications.data.find(n => !n.seen);
}

const Notification = ({ notification }) => (
  <div>
    <StyledNotificationTitle>

      find case modelid here and use in URL
      cofirm ntification as seen 
      show all unread + all today's notifications limit 10
      show all notifications on separate page

      <A href={'/cases/' + notification.case}>Task {notification.title}</A>
    </StyledNotificationTitle> 
    <StyledNotificationSubtitle>{notification.subtitle} at {notification.createdAt}</StyledNotificationSubtitle>
  </div>
)

const Header = (props) => {

  const [ notifications ] = useContext(NotificationsContext);
    
  const NotificationsPopover = (
    <StyledPopover id="popover-notifications">
      <Popover.Content> 
      { 
        notifications.loading ? <Loading /> :
        notifications.error ? <LoadingError /> :
        notifications.data && notifications.data.length == 0 ? <div>No new notifications.</div> :
        notifications.data
          .filter(n => !n.seen)
          .sort((a, b) => a.createdAt > b.createdAt)
          .filter((n, idx) => idx < 10)
          .map(n => <Notification key={n.id} notification={n} />)
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
      { hasNewNotifications(notifications) ? <StyledIndicator/> : <div/> }
    </A>
  );

  return (
    <StyledNavbar bg="white" sticky="top">
      <StyledToogle onClick={() => props.toggleSidebar()}>
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
