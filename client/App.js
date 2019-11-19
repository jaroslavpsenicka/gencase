import React, { useState, useContext } from 'react';
import { useRoutes, useRedirect } from 'hookrouter';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Contents from './components/Contents';
import { ModelsProvider } from './ModelsContext';
import { CasesProvider } from './CasesContext';

import ModelsPage from './pages/ModelsPage';
import ModelDetailPage from './pages/ModelDetailPage';
import ModelDataPage from './pages/ModelDataPage';
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
    "/models/:modelId/data/:dataId": ({modelId, dataId}) => <ModelDataPage modelId={modelId} dataId={dataId} />
  };

  useRedirect('/', '/cases');
  const RouteContainer = () => {
    return useRoutes(routes) || <NoPage />;
  };
  
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
