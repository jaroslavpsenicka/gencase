import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Image from 'react-bootstrap/Image';
import { A } from 'hookrouter';
import { faBars, faCog } from '@fortawesome/free-solid-svg-icons'
import { faBell } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styled from 'styled-components';

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

const Header = (props) => (
  <StyledNavbar bg="white" sticky="top">
    <StyledToogle onClick={() => props.toggleSidebar()}>
      <div className="icon-reorder tooltips" data-original-title="Toggle" data-placement="bottom">
        <FontAwesomeIcon icon={faBars} />
      </div>
    </StyledToogle>      
    <Navbar.Brand href="/cases">DataCase</Navbar.Brand>
    <Nav className="ml-auto">
      <A href="/settings" className="mt-1 ml-4 mr-2">
        <FontAwesomeIcon icon={faCog} size="lg"/></A>
      <A href="/notifications" className="mt-1 ml-4 mr-2">
        <FontAwesomeIcon icon={faBell} size="lg"/></A>
      <A href="/profile" className="ml-4 mr-2">
        <Image src={photo} roundedCircle/></A>
    </Nav>
  </StyledNavbar>
)

export default Header;
