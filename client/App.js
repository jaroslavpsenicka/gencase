import React, { useState } from 'react';
import { useRoutes, useRedirect } from 'hookrouter';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Contents from './components/Contents';

import ModelsPage from './pages/ModelsPage';
import CasesPage from './pages/CasesPage';
import NoPage from './pages/NoPage';

import './App.css';

const App = () => {

  const [ visible, toggleVisible ] = useState({ visible: true });

  const routes = {
    "/cases": () => <CasesPage/>,
    "/models": () => <ModelsPage />
  };

  useRedirect('/', '/cases');
  const RouteContainer = () => {
    return useRoutes(routes) || <NoPage />;
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

export default App;
