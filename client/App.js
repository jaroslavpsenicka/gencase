import React, { useState } from 'react';
import { useRoutes, useRedirect } from 'hookrouter';
import loadable from '@loadable/component'
import Axios from 'axios';
import { ModelsProvider } from './ModelsContext';
import { CasesProvider } from './CasesContext';
import { NotificationsProvider } from './NotificationsContext';

import './App.css';

const App = () => {

  const [ visible, toggleVisible ] = useState({ visible: true });

  const Header = loadable(() => import(/* webpackChunkName: "components" */ './components/Header'));  
  const Contents = loadable(() => import(/* webpackChunkName: "components" */ './components/Contents'));  
  const Sidebar = loadable(() => import(/* webpackChunkName: "components" */ './components/Sidebar'));  
  const Dashboard = loadable(() => import(/* webpackChunkName: "pages" */ './pages/DashboardPage'));  
  const CasesPage = loadable(() => import(/* webpackChunkName: "pages" */ './pages/CasesPage'));  
  const CaseDetailPage = loadable(() => import(/* webpackChunkName: "pages" */ './pages/CaseDetailPage'));  
  const ModelsPage = loadable(() => import(/* webpackChunkName: "pages" */ './pages/ModelsPage'));
  const ModelDetailPage = loadable(() => import(/* webpackChunkName: "pages" */ './pages/ModelDetailPage'));
  const EntityPage = loadable(() => import(/* webpackChunkName: "pages" */ './pages/EntityPage'));
  const NoPage = loadable(() => import(/* webpackChunkName: "pages" */ './pages/NoPage'));

  const routes = {
    "/cases": () => <Dashboard />,
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
  if (process.env.REACT_APP_SERVICE_URL) {
    console.log('Using service', process.env.REACT_APP_SERVICE_URL);
  }
  if (process.env.REACT_APP_JWT_TOKEN) {
    console.log('Using authorization token', process.env.REACT_APP_JWT_TOKEN.substring(0, 16));
    Axios.defaults.headers.common['Authorization'] = 'Bearer ' + process.env.REACT_APP_JWT_TOKEN;
  }

  return (
    <ModelsProvider>
      <CasesProvider>
        <NotificationsProvider>
          <Header toggleSidebar={() => toggleVisible(!visible)}/>
          <Sidebar visible={visible}/>
          <Contents withSidebar={visible}>
            <RouteContainer />
          </Contents>
        </NotificationsProvider>
      </CasesProvider>
    </ModelsProvider>
  )
}

export default App;
