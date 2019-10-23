import React, { useState } from 'react';
import { faStar, faAngleDown, faAngleUp, faPlus } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarOutline, faComment } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ModelsPage = () => {

  const data = [ 
    { id: 1, name: 'Mortgage', description: 'Simple mortgage case.', revision: 3, author: 'John Doe' },
    { id: 2, name: 'Loan', description: 'Customer loan as we love it.', revision: 1, author: 'Mary Doe' },
    { id: 3, name: 'Test', description: 'A brand new product for the rest of us.', revision: 1, author: 'John Doe' }
  ];

  const [ models, setModels ] = useState(data);

  const toggleStarred = (model) => {
    setModels(prev => prev.map((row) => {
      return row.id === model.id ? {...row, starred: !row.starred} : row
    }));
  }

  const toggleDetail = (model) => {
    setModels(prev => prev.map((row) => {
      return row.id === model.id ? {...row, detailed: !row.detailed} : row
    }));
  }

  const NoModels = () => (
    <div>No, there is no model.</div>
  );

  const ModelActions = props => (
    <div className="pt-2 float-right">
      <FontAwesomeIcon icon={props.model.starred ? faStar : faStarOutline} size="lg" 
        className={props.model.starred ? 'cursor-pointer text-success' : 'cursor-pointer'}
        onClick={() => toggleStarred(props.model)}/>
      <FontAwesomeIcon icon={props.model.detailed ? faAngleUp : faAngleDown} size="lg" 
        className="ml-3 cursor-pointer"
        onClick={() => toggleDetail(props.model)}/>
    </div>
  )

  const ModelDetail = props => {
    return !props.model.detailed ? null : (
      <div className="col-md-12 pt-3 text-secondary">
        Revision: <span className="text-black">{props.model.revision}</span><br/>
        Created by: <span className="text-black">{props.model.author}</span><br/>
      </div>
    )
  }

  const ModelRow = props => (
    <div className="font-weight-normal">
      <div className="p-2 pl-3 mb-2 mr-3 bg-white text-dark">
        <div className="col-md-12">
          <ModelActions model={props.model} />
          <h5 className="text-primary">{props.model.name}</h5>
          <div className="text-secondary">{props.model.description}</div>
        </div>
        <ModelDetail model={props.model} />
      </div>
    </div>  
  )

  return (  
    <div>
      <h4 className="text-muted font-weight-light text-uppercase mb-4 mr-3">
        <FontAwesomeIcon icon={faPlus} className="float-right"/>
        <FontAwesomeIcon icon={faComment} className="mr-4 float-right"/>
        <FontAwesomeIcon icon={faStarOutline} className="mr-4 float-right"/>
        Models
      </h4>
      { models.length > 0 ? models.map(m => <ModelRow model={m} key={m.id} />) : <NoModels /> }
    </div>
  )
};

export default ModelsPage;
