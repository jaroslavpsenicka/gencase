import React, { useState, useContext, useRef } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { faStar, faAngleDown, faAngleUp, faPlus, faComment } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarOutline } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Axios from 'axios';
import { byId } from './ContextUtils';

import { ModelsContext } from '../ModelsContext';
import Loading from '../components/Loading';
import LoadingError from '../components/LoadingError'

const ModelDetailPage = (props) => {

  const [ models, setModels ] = useContext(ModelsContext);

  const updateData = (prev, model) => {
    return prev.data.map(row => {
      return row.id === model.id ? {...row, starred: !row.starred} : row 
    })
  }

  const toggleStarred = (model) => {
    Axios.put('http://localhost:8080/api/models/' + model.id, { starred: !model.starred })
      .then(resp => setModels(prev => {
        const data = updateData(prev, model);
        return { ...prev, data: data, byId: byId(data)}}))
      .catch(err => console.log('cannot star', model, err));
  }

  const Model = (props) => (
    <Row>
      <h4 className="w-100 text-muted font-weight-light text-uppercase mb-4 mr-3">
        <div className="mr-4 float-right cursor-pointer">
          <FontAwesomeIcon icon={props.model.starred ? faStar : faStarOutline} 
            className={props.model.starred ? 'text-success' : '' }
            onClick={() => toggleStarred(props.model)} />
        </div>
        { props.model.name }
      </h4>
      <div>{props.model.description}</div>
    </Row>
  )

  return (
    <Container className="pt-4">
      {
        models.loading ? <Loading text={'Loading model ' + props.id }/> : 
        models.error ? <LoadingError error = { models.error }/> :  
        models.data ? <Model model = { models.byId[props.id] }/> : <div />
      }
    </Container>
  )
}

export default ModelDetailPage;