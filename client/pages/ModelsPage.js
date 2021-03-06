import React, { useState, useContext, useRef } from 'react';
import axios from 'axios'
import { faStar, faPlus } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarOutline } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { navigate } from 'hookrouter';
import { byId } from '../ContextUtils';

import Loading from '../components/Loading';
import LoadingError from '../components/LoadingError';
import { ModelsContext  } from '../ModelsContext';

const SERVICE_URL = process.env.REACT_APP_SERVICE_URL || '';

const ModelsPage = () => {

  const [ models, setModels ] = useContext(ModelsContext);
  const [ filter, setFilter ] = useState({ starred: false });

  const inputFile = useRef(null); 

  const onUpload = (event) => {
    if (event.target.name === "file") {
      const formData = new FormData();
      formData.append('file', event.target.files[0], event.target.files[0].name);
      axios.post(SERVICE_URL + '/api/models', formData)
        .then(resp => setModels([...models, resp.data]))
        .catch(err => console.log(err));
      }
  }

  const updateData = (prev, model) => {
    return prev.data.map(row => {
      return row.id === model.id ? {...row, starred: !row.starred} : row 
    })
  }

  const toggleStarred = (model) => {
    axios.put(SERVICE_URL + '/api/models/' + model.id, { starred: !model.starred })
    .then(resp => setModels(prev => {
      const data = updateData(prev, model);
      return { ...prev, data: data, byId: byId(data)}}))
    .catch(err => console.log('cannot star', model, err));
  }

  const Models = (props) => {
    const filtered = props.models
      .filter(m => filter.starred ? m.starred : true)
      .map(m => <ModelCard model={m} key={m.id} />);
    return filtered.length > 0 ? filtered : <NoModels />
  }

  const NoModels = () => (
    <div className="mt-5 text-center text-secondary">No, there is no such model.</div>
  );

  const ModelActions = props => (
    <div className="pt-2 pr-3 float-right">
      <FontAwesomeIcon icon={props.model.starred ? faStar : faStarOutline} size="lg" 
        className={props.model.starred ? 'cursor-pointer text-success' : 'cursor-pointer'}
        onClick={() => toggleStarred(props.model)}/>
    </div>
  )

  const ModelCard = props => (
    <Col md={6} lg={4} xl={3}>
      <Col md={12} className="h-150px b-2-ddd p-2 pl-3 mb-4 bg-white text-dark">
        <ModelActions model={props.model} />
        <div className="col-md-10 cursor-pointer" onClick={() => navigate('/models/' + props.model.id)}>
          <h5 className="pt-2 text-primary">{props.model.name}</h5>
          <div className="h-100px text-secondary">{props.model.description ? props.model.description : 'No description.'}</div>
        </div>
      </Col>
    </Col>
  )

  return (  
    <div className="p-4">
      <input type="file" name="file" id="file" ref={inputFile} className="d-none" 
        onChange={(event) => onUpload(event)} />
      <h4 className="w-100 text-muted font-weight-light text-uppercase mb-4 mr-3">
        <FontAwesomeIcon icon={faPlus} className="mr-2 float-right cursor-pointer text-success"
          onClick={() => inputFile.current.click()}/>
        <FontAwesomeIcon icon={filter.starred ? faStar : faStarOutline} 
          className="mr-4 float-right cursor-pointer"
          onClick={() => setFilter({ ...filter, starred: !filter.starred })} />
        Models
      </h4>
      <Row>
        { 
          models.loading ? <Loading /> : 
          models.error ? <LoadingError error = { models.error }/> :  
          models.data ? <Models models = { models.data }/> : <div />
        }
      </Row>
    </div>
  )
};

export default ModelsPage;
