import React, { useContext } from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { A } from 'hookrouter';
import { faHome, faCog, faCube } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { ModelsContext  } from '../ModelsContext';

import './Sidebar.css';

const Sidebar = (props) => {  

  const [ models, setModels ] = useContext(ModelsContext);

  const Cases = ({models}) => (
    <ul>
      { 
        models
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(m => <CaseRow id={m.id} name={m.name} key={m.id} />) 
      }
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
        <div className="mb-2">
            <FontAwesomeIcon icon={faHome} className="text-secondary"/>
            <A className="pb-2 pl-2 font-weight-bold" href="/cases">DASHBOARD</A>
          </div>
          <Cases models = { models.data ? models.data : [] }/>
          <div className="mb-2">
            <FontAwesomeIcon icon={faCube} className="text-secondary"/>
            <A className="pb-2 pl-2 font-weight-bold" href="/models">MODELS</A>
          </div>
          <div className="mb-2">
            <FontAwesomeIcon icon={faCog} className="text-secondary"/>
            <A className="pb-2 pl-2 font-weight-bold" href="/settings">SETTINGS</A>
          </div>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  ); 
};

export default Sidebar;

