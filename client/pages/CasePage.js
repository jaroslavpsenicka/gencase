import React, { useState, useContext, useRef } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { ModelsContext  } from '../ModelsContext';

import Loading from '../components/Loading';
import LoadingError from '../components/LoadingError';

const CasePage = (props) => {

  const [ models, setModels ] = useContext(ModelsContext);

  const NoCase = () => (
    <div>Nope, no such case.</div>
  )

  const CaseDetail = () => (
    <h4 className="text-muted font-weight-light text-uppercase mb-4 mr-3">
      <FontAwesomeIcon icon={faPlus} className="mr-2 float-right cursor-pointer text-success"
        onClick={() => console.log("Add")}/>
      { models.byId[props.id].name + 's' }
    </h4>
  )

  return (  
    <div>
      {
        models.loading ? <Loading /> : 
        models.error ? <LoadingError error = { models.error }/> :  
        models.data && models.byId[props.id] ? <CaseDetail /> : 
        <NoCase />  
      }
    </div>
  )
};

export default CasePage;



