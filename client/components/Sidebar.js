import React, { useContext } from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { A } from 'hookrouter';
import { faHome, faCog, faCube } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styled from 'styled-components';

import { ModelsContext  } from '../ModelsContext';

const Sidebar = ({ visible }) => {  

  const [ models ] = useContext(ModelsContext);

  const Cases = ({models}) => (
    <ul>
      { 
        models
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(m => <CaseRow id={m.id} name={m.name} key={m.id} />) 
      }
    </ul>
  )

  const CaseRow = ({ id, name }) => (  
    <li>
      <StyledA href={"http://localhost:8081/cases/"+ id}>{name}s</StyledA>
    </li>
  )

  const StyledA = styled(A)`
    color: rgba(0,0,0,.7);
  `
  const StyledNavbar = styled(Navbar)`
    border-bottom: none;
    width: 200px;
    position: fixed;
    padding: 25px;
  `
  const StyledNav = styled(Nav)`
    flex-direction: column !important;
  `

  return (
    <StyledNavbar className={ visible ? '' : 'd-none' }>
      <Navbar.Collapse>
        <StyledNav className="vertical">
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
        </StyledNav>
      </Navbar.Collapse>
    </StyledNavbar>
  ); 
};

export default Sidebar;

