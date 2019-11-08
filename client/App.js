import React, { useState, useContext } from 'react';
import { useRoutes, useRedirect } from 'hookrouter';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Contents from './components/Contents';
import { ModelsProvider } from './ModelsContext';

import ModelsPage from './pages/ModelsPage';
import ModelDetailPage from './pages/ModelDetailPage';
import CasesPage from './pages/CasesPage';
import DashboardPage from './pages/DashboardPage';
import NoPage from './pages/NoPage';

import './App.css';

const App = () => {

  const [ visible, toggleVisible ] = useState({ visible: true });

  const routes = {
    "/cases": () => <DashboardPage/>,
    "/cases/:id": ({id}) => <CasesPage id={id} />,
    "/models": () => <ModelsPage />,
    "/models/:id": ({id}) => <ModelDetailPage id={id}/>
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
