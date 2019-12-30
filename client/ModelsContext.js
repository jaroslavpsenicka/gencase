import React, { useState, useEffect, createContext } from 'react';
import { byId } from './ContextUtils';
import Axios from 'axios'

const SERVICE_URL = process.env.REACT_APP_SERVICE_URL || '';
const ModelsContext = createContext([{}, () => {}]);

const ModelsProvider = (props) => {

  const [models, setModels] = useState({ loading: true });

  useEffect(() => {
    Axios.get(SERVICE_URL + '/api/models')
      .then(response => setModels({ 
        loading: false, 
        data: response.data, 
        byId: byId(response.data) }))
      .catch(err => setModels({ loading: false, error: err }))
  }, []);


  return (
    <ModelsContext.Provider value={[models, setModels]}>
      {props.children}
    </ModelsContext.Provider>
  );
}

export { ModelsContext, ModelsProvider, byId };