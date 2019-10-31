import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Image from 'react-bootstrap/Image';
import { A } from 'hookrouter';
import { faBars, faSlidersH } from '@fortawesome/free-solid-svg-icons'
import { faBell } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './Header.css';
import photo from '../static/photo.jpg';

const Header = (props) => (
  <Navbar bg="white" sticky="top">
    <div className="toggle-nav" onClick={() => props.toggleSidebar()}>
      <div className="icon-reorder tooltips" data-original-title="Toggle" data-placement="bottom">
        <FontAwesomeIcon icon={faBars} />
      </div>
    </div>      
    <Navbar.Brand href="/cases">DataCase</Navbar.Brand>
    <Nav className="ml-auto">
      <A href="/models" className="mt-1 ml-4 mr-2">
        <FontAwesomeIcon icon={faSlidersH} size="lg"/></A>
      <A href="/notifications" className="mt-1 ml-4 mr-2">
        <FontAwesomeIcon icon={faBell} size="lg"/></A>
      <A href="/profile" className="ml-4 mr-2">
        <Image src={photo} roundedCircle/></A>
    </Nav>
  </Navbar>
)

export default Header;
