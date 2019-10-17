import React from 'react';
import { useRoutes, useRedirect } from 'hookrouter';
import Header from './components/Header';

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

  useRedirect('/', '/cases');

  const RouteContainer = () => {
    return useRoutes(routes) || <NotFound />;
  };
   
  return (
    <div>
      <Header />
      <div className="container">
        <RouteContainer />
      </div>
    </div>
  )
}

export default App
