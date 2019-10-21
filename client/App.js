import React, { useState } from 'react';
import { useRoutes, useRedirect } from 'hookrouter';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Contents from './components/Contents';

import About from './pages/About';
import Models from './pages/Models';
import Cases from './pages/Cases';
import NotFound from './pages/NotFound';

import './App.css';

const App = () => {
 
  const routes = {
    "/cases": () => <Cases/>,
    "/about": () => <About />,
    "/models": () => <Models />
  };

  useRedirect('/', '/cases');

  const RouteContainer = () => {
    return useRoutes(routes) || <NotFound />;
  };

  const sidebarState = { 
    visible: true
  };

  const [ visible, toggleVisible ] = useState(sidebarState);
   
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
