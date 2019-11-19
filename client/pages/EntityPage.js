import React, { useState, useContext, useRef } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';

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
    <div>      
      <Row className="p-2 ml-0 mr-1 text-dark font-weight-bold">
        <Col md={1}></Col> 
        <Col md={3}>Name</Col> 
        <Col md={2}></Col> 
      </Row>
      { attrs.map(a => <Attr attr={a} key={a.name} />)}
    </div>
  )

  const IdBadge = () => (
    <Badge variant="primary">ID</Badge> 
  )

  const Attr = ({attr}) => (
    <Row className="p-2 ml-0 mr-1 mb-1 bg-white text-dark">
      <Col md={1} className="text-right">{ attr.id ? <IdBadge /> : ''}</Col>
      <Col md={3}>{attr.name}</Col>
      <Col md={2}>{attr.type}</Col>
      <Col md={6}></Col>
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
        <div className="mt-4">
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