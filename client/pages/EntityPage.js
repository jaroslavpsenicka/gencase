import React, { useState, useContext, useRef } from 'react';
import Container from 'react-bootstrap/Container';

import { ModelsContext } from '../ModelsContext';
import Loading from '../components/Loading';
import LoadingError from '../components/LoadingError'

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

  const DataModel = ({model}) => {
    const entity = findEntity(model, entityName);
    return (
      <div>
        <h4 className="w-100 text-muted font-weight-light text-uppercase mb-4 mr-3">
          { model.name } / { entityName }
        </h4>
        <div>{entity.description ? entity.description : 'No description.'}</div>
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