import React, { useState, useContext } from 'react';
import { useRoutes, useRedirect } from 'hookrouter';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Contents from './components/Contents';
import { ModelsProvider } from './ModelsContext';

import ModelsPage from './pages/ModelsPage';
import CasesPage from './pages/CasesPage';
import CasePage from './pages/CasePage';
import NoPage from './pages/NoPage';

import './App.css';

const App = () => {

  const [ visible, toggleVisible ] = useState({ visible: true });

  const routes = {
    "/cases": () => <CasesPage/>,
    "/cases/:id": ({id}) => <CasePage id={id} />,
    "/models": () => <ModelsPage />
  };

  useRedirect('/', '/cases');
  const RouteContainer = () => {
    return useRoutes(routes) || <NoPage />;
  };
  
  return (
    <ModelsProvider>
      <Header toggleSidebar={() => toggleVisible(!visible)}/>
      <Sidebar visible={visible}/>
      <Contents withSidebar={visible}>
        <RouteContainer />
      </Contents>
    </ModelsProvider>
  )
}

export default App;
