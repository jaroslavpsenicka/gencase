import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { A } from 'hookrouter';

import './Header.css'

const Header = () => (
  <Navbar bg="white" expand="md" sticky="top">
    <Navbar.Brand href="#home">DataCase</Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="mr-auto">
        <Nav.Link><A href="/cases">Cases</A></Nav.Link>
        <Nav.Link><A href="/admin">Admin</A></Nav.Link>
        <Nav.Link><A href="/about">About</A></Nav.Link>
      </Nav>
    </Navbar.Collapse>
  </Navbar>
);

export default Header;
