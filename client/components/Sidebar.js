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
          <A className="pb-2 font-weight-bold" href="/cases">Cases</A>
          <ul>
            <li><A className="nav-link-tight" href="/cases/mortgages">Mortgages</A></li>
            <li><A className="nav-link-tight" href="/cases/loans">Loans</A></li>
          </ul>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  ); 
};

export default Sidebar;

