import React, { useState } from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { A } from 'hookrouter';

import './Sidebar.css';

const Sidebar = (props) => {

  return (
    <Navbar className={ props.visible ? 'sidebar' : 'sidebar-hidden' }>
      <Navbar.Collapse>
        <Nav className="vertical">
          <A className="nav-link" href="/cases">Cases</A>
          <ul>
            <li><A className="nav-link-tight" href="/cases/mortgages">Mortgages</A></li>
            <li><A className="nav-link-tight" href="/cases/loans">Loans</A></li>
          </ul>
          <A className="nav-link" href="/models">Models</A>
          <A className="nav-link" href="/about">About</A>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  ); 
};

export default Sidebar;

