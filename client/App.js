import React, { useState } from 'react';
import { useRoutes, useRedirect } from 'hookrouter';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Contents from './components/Contents';
import { ModelsProvider } from './ModelsContext';
import { CasesProvider } from './CasesContext';
import Axios from 'axios';

import ModelsPage from './pages/ModelsPage';
import ModelDetailPage from './pages/ModelDetailPage';
import EntityPage from './pages/EntityPage';
import CasesPage from './pages/CasesPage';
import CaseDetailPage from './pages/CaseDetailPage';
import DashboardPage from './pages/DashboardPage';
import NoPage from './pages/NoPage';

import './App.css';

const App = () => {

  const [ visible, toggleVisible ] = useState({ visible: true });

  const routes = {
    "/cases": () => <DashboardPage/>,
    "/cases/:modelId": ({modelId}) => <CasesPage modelId={modelId} />,
    "/cases/:modelId/:id": ({modelId, id}) => <CaseDetailPage modelId={modelId} id={id} />,
    "/models": () => <ModelsPage />,
    "/models/:modelId": ({modelId}) => <ModelDetailPage modelId={modelId}/>,
    "/models/:modelId/entity/:entityName": ({modelId, entityName}) => <EntityPage modelId={modelId} entityName={entityName} />
  };

  useRedirect('/', '/cases');
  const RouteContainer = () => {
    return useRoutes(routes) || <NoPage />;
  };
  
  Axios.defaults.headers.common['X-Version'] = process.env.REACT_APP_VERSION;
  Axios.defaults.headers.common['X-Environment'] = process.env.NODE_ENV;
  if (process.env.REACT_APP_JWT_TOKEN) {
    console.log('Using authorization token', process.env.REACT_APP_JWT_TOKEN);
    Axios.defaults.headers.common['Authorization'] = 'Bearer ' + process.env.REACT_APP_JWT_TOKEN;
  }

  return (
    <ModelsProvider>
    <CasesProvider>
      <Header toggleSidebar={() => toggleVisible(!visible)}/>
      <Sidebar visible={visible}/>
      <Contents withSidebar={visible}>
        <RouteContainer />
      </Contents>
    </CasesProvider>
    </ModelsProvider>
  )
}

export default App;
