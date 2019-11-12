import React, { useState, createContext } from 'react';
import { byId, findByIdAndReplace } from './ContextUtils';
import Axios from 'axios';

const CasesContext = createContext([{}, () => {}]);

const CasesProvider = (props) => {

  const [cases, setCases] = useState({ loading: true });

  const loadCases = (modelId) => {
    if (cases.modelId == modelId && cases.byId) return;
    setCases(prev => { return { ...prev, loading: true }});
    Axios.get('http://localhost:8080/api/models/' + modelId + '/cases')
      .then(response => setCases({ 
        loading: false, 
        modelId: modelId, 
        data: response.data, 
        byId: byId(response.data) }))
      .catch(err => setCases({ loading: false, error: err }))
  }

  const loadCase = (caseId) => {
    if (cases.byId && cases.byId[caseId] && cases.byId[caseId].detailed) return;
    setCases(prev => { return { ...prev, loading: true }});
    Axios.get('http://localhost:8080/api/cases/' + caseId)
      .then(response => {
        const newData = cases.data ? findByIdAndReplace(cases.data, response.data) : [response.data];
        setCases({ loading: false, detailed: true, data: newData, byId: byId(newData) });
      }).catch(err => setCases({ loading: false, error: err }));
  }

  return (
    <CasesContext.Provider value={[cases, setCases, loadCases, loadCase]}>
      {props.children}
    </CasesContext.Provider>
  );
}

export { CasesContext, CasesProvider, byId };