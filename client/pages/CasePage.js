import React, { useState, useContext, useRef } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { ModelsContext  } from '../ModelsContext';

const CasePage = (props) => {

  const [ models, setModels ] = useContext(ModelsContext);

  return (  
    <div>
      <h4 className="text-muted font-weight-light text-uppercase mb-4 mr-3">
        <FontAwesomeIcon icon={faPlus} className="mr-2 float-right cursor-pointer text-success"
          onClick={() => console.log("Add")}/>
        { models.byId[props.id].name + 's' }
      </h4>
    </div>
  )
};

export default CasePage;



