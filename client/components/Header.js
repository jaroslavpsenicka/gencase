import React, { useState, useContext } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { A } from 'hookrouter';
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './Header.css'

const Header = (props) => {

  const toggleNav = () => {
    console.log('toggle nav');
    props.toggleSidebar();
  }

  return (
    <Navbar bg="white" expand="md" sticky="top">
      <div className="toggle-nav" onClick={() => toggleNav()}>
        <div className="icon-reorder tooltips" data-original-title="Toggle" data-placement="bottom">
          <FontAwesomeIcon icon={faBars} />
        </div>
      </div>      
      <Navbar.Brand href="/cases">DataCase</Navbar.Brand>
    </Navbar>
  );
}

export default Header;
