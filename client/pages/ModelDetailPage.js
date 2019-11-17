import React, { useState, useContext, useRef } from 'react';
import Container from 'react-bootstrap/Container';
import { A } from 'hookrouter';
import { faStar, faAngleDown, faAngleUp, faPlus, faComment } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarOutline } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Timeline, TimelineItem }  from 'vertical-timeline-component-for-react';
import Axios from 'axios';
import { byId } from '../ContextUtils';

import { ModelsContext } from '../ModelsContext';
import Loading from '../components/Loading';
import LoadingError from '../components/LoadingError'

import '../static/timeline.css';

const ModelDetailPage = ({id}) => {

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

  const NoPhases = () => (
    <div className="text-secondary">No phases defined yet. <A href="">Click here</A> to 
    find out what case phase means and why it is important.</div>
  )

  const Phase = ({phase, initial}) => (
    <TimelineItem key={phase.id} dateText={phase.name} className={initial ? 'initial' : 'default'}>
      <p>{phase.description}</p>
      <p className="font-weight-bold">Data Model: <A href="">{phase.name}</A></p>
    </TimelineItem>
  )

  const Phases = ({phases}) => (
    <Timeline animate={false} className="phase" lineColor="lightgrey">
      { phases.map(ph => <Phase phase={ph} initial={ph.initial} key={ph.name}/>) }
    </Timeline>
  )

  const Model = ({model}) => (
    <div>
      <h4 className="w-100 text-muted font-weight-light text-uppercase mb-4 mr-3">
        <div className="mr-4 float-right cursor-pointer">
          <FontAwesomeIcon icon={model.starred ? faStar : faStarOutline} 
            className={model.starred ? 'text-success' : '' }
            onClick={() => toggleStarred(props.model)} />
        </div>
        { model.name }
      </h4>
      <div>{model.description}</div>
      <h5 className="pt-4">Phases</h5>
      { model.spec && model.spec.phases && model.spec.phases.length > 0 ? 
        <Phases phases={model.spec.phases}/> : 
        <NoPhases /> }
    </div>
  )

  return (
    <Container className="pt-4">
      {
        models.loading ? <Loading text={'Loading model ' + id }/> : 
        models.error ? <LoadingError error = { models.error }/> :  
        models.data ? <Model model = { models.byId[id] }/> : <div />
      }
    </Container>
  )
}

export default ModelDetailPage;