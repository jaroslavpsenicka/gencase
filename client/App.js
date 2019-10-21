import React, { useState } from 'react';
import { useRoutes, useRedirect } from 'hookrouter';
import { Row, Col } from 'react-bootstrap';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Contents from './components/Contents';

import About from './pages/About';
import Admin from './pages/Admin';
import Cases from './pages/Cases';
import NotFound from './pages/NotFound';

import './App.css';

const App = () => {
 
  const routes = {
    "/cases": () => <Cases/>,
    "/about": () => <About />,
    "/admin": () => <Admin />
  };

  const sidebarState = { 
    visible: true,
    toggleVisible: toggleVisible
  };

  const [ visible, toggleVisible ] = useState(sidebarState);

  useRedirect('/', '/cases');

  const RouteContainer = () => {
    return useRoutes(routes) || <NotFound />;
  };
   
  return (
    <div>
      <Header toggleSidebar={() => toggleVisible(!visible)}/>
      <Sidebar visible={visible}/>
      <Contents withSidebar={visible}>
        <RouteContainer />
      </Contents>
    </div>
  )
}

export default App
