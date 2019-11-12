import React, { useState, useEffect, createContext } from 'react';
import { byId } from './ContextUtils';
import Axios from 'axios'

const ModelsContext = createContext([{}, () => {}]);

const ModelsProvider = (props) => {

  const [models, setModels] = useState({ loading: true });

  useEffect(() => {
    Axios.get('http://localhost:8080/api/models')
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