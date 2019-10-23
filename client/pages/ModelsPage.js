import React, { useState } from 'react';
import { faStar, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarOutline } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ModelsPage = () => {

  const data = [ 
    { id: 1, name: 'Mortgage', description: 'Simple mortgage case' },
    { id: 2, name: 'Loan', description: 'Customer loan as we love it' },
    { id: 3, name: 'Test', description: 'A brand new product for the rest of us' }
  ];

  const [ models, setModels ] = useState(data);

  const toggleStarred = (model) => {
    setModels(prev => prev.map((row) => {
      return row.id === model.id ? {...row, starred: !row.starred} : row
    }));
  }

  const toggleDetail = (model) => {
    setModels(prev => prev.map((row) => {
      return row.id === model.id ? {...row, detail: !row.detail} : row
    }));
  }

  const NoModels = () => (
    <div>No, there is no model.</div>
  );

  const ModelRow = props => (
    <div className="d-flex p-2 pl-3 mb-1 mr-3 bg-white text-dark">
      <div className="flex-grow-1">
        <h5 className="text-primary">{props.model.name}</h5>
        <div className="text-secondary">{props.model.description}</div>
      </div>
      <ModelActions model={props.model}/>
    </div>
  )

  const ModelActions = props => (
    <div className="p-3">
        <FontAwesomeIcon icon={props.model.starred ? faStar : faStarOutline} size="lg" 
          className={props.model.starred ? 'cursor-pointer text-success' : 'cursor-pointer'}
          onClick={() => toggleStarred(props.model)}/>
        <FontAwesomeIcon icon={faAngleDown} size="lg" className="ml-3 cursor-pointer"
          onClick={() => toggleDetail(props.model)}/>
    </div>
  )

  return (  
    <div>
      <h5 className="text-muted font-weight-light text-uppercase mb-3">Models</h5>
      { models.length > 0 ? models.map(m => <ModelRow model={m} key={m.id} />) : <NoModels /> }
    </div>
  )
};

export default ModelsPage;
