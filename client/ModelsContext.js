import React, { useState, useEffect, createContext } from 'react';
import axios from 'axios'

const ModelsContext = createContext([{}, () => {}]);

const ModelsProvider = (props) => {

  const [models, setModels] = useState();

  useEffect(() => {
    axios.get('http://localhost:8080/api/models')
      .then(response => setModels({ data: response.data }))
      .catch(err => setModels({ error: err }))
  }, []);

  return (
    <ModelsContext.Provider value={[models, setModels]}>
      {props.children}
    </ModelsContext.Provider>
  );
}

export { ModelsContext, ModelsProvider };