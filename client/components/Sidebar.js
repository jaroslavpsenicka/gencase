import React, { useContext } from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { A } from 'hookrouter';

import { ModelsContext  } from '../ModelsContext';

import './Sidebar.css';

const Sidebar = (props) => {  

  const [ models, setModels ] = useContext(ModelsContext);

  const Cases = (props) => (
    <ul>
      { props.models.map(m => <CaseRow id={m.id} name={m.name} key={m.id} />) }
    </ul>
  )

  const CaseRow = (props) => (  
    <li>
      <A className="nav-link-tight" href={"http://localhost:8081/cases/"+ props.id}>{props.name}s</A>
    </li>
  )

  return (
    <Navbar className={ props.visible ? 'sidebar' : 'sidebar-hidden' }>
      <Navbar.Collapse>
        <Nav className="vertical">
          <A className="pb-2 font-weight-bold" href="/cases">Cases</A>
          <Cases models = { models.data ? models.data : [] }/>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  ); 
};

export default Sidebar;

