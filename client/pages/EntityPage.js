import React, { useState, useContext, useRef } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import { faArrowRight, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { ModelsContext } from '../ModelsContext';
import Loading from '../components/Loading';
import LoadingError from '../components/LoadingError'
import { A } from 'hookrouter';

const findEntity = (model, entityName) => {
  return model.spec.entities.find(e => {
    return e.name === entityName;
  });
}

const EntityPage = ({modelId, entityName}) => {

  const [ models, setModels ] = useContext(ModelsContext);

  const NoSuchModel = () => (
    <div className="mt-5 mb-3 text-center text-secondary">No such model: {modelId}.</div>
  )

  const NoSuchEntity = () => (
    <div className="mt-5 mb-3 text-center text-secondary">No such entity: {entityName}.</div>
  )

  const NoAttrs = () => (
    <div className="mt-5 mb-3 text-center text-secondary">No attributes defined.</div>
  )

  const AttrList = ({attrs}) => (
    <div className="mt-4">      
      { attrs.map(a => <Attr attr={a} key={a.name} />)}
    </div>
  )

  const IdBadge = () => (
    <Badge variant="danger">ID</Badge> 
  )

  const InputBadge = () => (
    <Badge variant="success">IN</Badge> 
  )

  const additionals = (attr) => {
    var result = [];
    if (attr.notEmpty) result.push('Required');
    if (attr.min && !attr.max) result.push('Min ' + attr.min)
    if (!attr.min && attr.max) result.push('Max ' + attr.max)
    if (attr.min && attr.max) result.push('Range ' + attr.min + ' to ' + attr.max)
    return result;
  }

  const Attr = ({attr}) => (
    <Row className="p-2 ml-0 mr-1 mb-1 bg-white text-dark">
      <Col md={1} className="text-right">
      { 
        attr.id ? <IdBadge /> : 
        attr.input ? <InputBadge /> : ''
      }
      </Col>
      <Col md={3}>{attr.name}</Col>
      <Col md={2}>{attr.type}</Col>
      <Col md={6}>
        <ul className="mb-0">
          { additionals(attr).map(a => <li key={a}>{a}</li>) }
        </ul>
      </Col>
    </Row>
  )

  const Extends = ({entity}) => (
    <div>Extends: <A href={'/models/' + modelId + '/entity/' + entity}>{entity}</A></div>
  )

  const DataModel = ({model}) => {
    const entity = findEntity(model, entityName);
    return (
      <div>
        <h4 className="w-100 text-muted font-weight-light text-uppercase mb-4 mr-3">
          { model.name } / { entityName }
        </h4>
        <div>{entity.description ? entity.description : 'No description.'}</div>
        { entity.extends ? <Extends entity={entity.extends}/> : '' }
        <div className="mt-2">
          { entity.attributes && entity.attributes.length > 0 ? <AttrList attrs={entity.attributes} /> : 
            <NoAttrs /> } 
        </div>
      </div>
    )
  }

  return (
    <Container className="pt-4">
      {
        models.loading ? <Loading text={'Loading model ' + modelId }/> : 
        models.error ? <LoadingError error = { models.error }/> :  
        models.data && !models.byId[modelId] ? <NoSuchModel /> :
        models.data && !findEntity(models.byId[modelId], entityName) ? <NoSuchEntity /> : 
        <DataModel model={models.byId[modelId]} />
      }
    </Container>
  )
}

export default EntityPage;