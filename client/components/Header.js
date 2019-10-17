import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { A } from 'hookrouter';
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './Header.css'

const Header = () => {

  return (
    <Navbar bg="white" expand="md" sticky="top">
      <div className="toggle-nav" onClick={() => console.log('toggle nav')}>
        <div className="icon-reorder tooltips" data-original-title="Toggle" data-placement="bottom">
          <FontAwesomeIcon icon={faBars} />
        </div>
      </div>
      
      <Navbar.Brand href="/cases">DataCase</Navbar.Brand>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <A className="nav-link" href="/cases">Cases</A>
          <A className="nav-link" href="/admin">Admin</A>
          <A className="nav-link" href="/about">About</A>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Header;
