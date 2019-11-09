import React, { useState, useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { faStar, faAngleDown, faAngleUp, faPlus, faComment } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarOutline, faComment as faCommentOutline} from '@fortawesome/free-regular-svg-icons'
import axios from 'axios'
import { navigate } from 'hookrouter';

import { ModelsContext  } from '../ModelsContext';

import Loading from '../components/Loading';
import LoadingError from '../components/LoadingError';

const CasesPage = ({modelId}) => {

  const [ models ] = useContext(ModelsContext);
  const [ cases, setCases ] = useState({ loading: true });
  const [ filter, setFilter ] = useState({ starred: false, commented: false });

  useEffect(() => {
    axios.get('http://localhost:8080/api/models/' + modelId + '/cases')
      .then(response => setCases({ 
        loading: false, 
        data: response.data, 
        byId: byId(response.data) }))
      .catch(err => setCases({ loading: false, error: err }))
  }, [modelId]);

  const byId = (data) => {
    return data.reduce((obj, item) => {
      obj[item.id] = item
      return obj
    }, {});
  }

  const setCaseDetail = (id, value) => {
    setCases(prev => { 
      return { ...prev, data: prev.data.map((row) => {
        return row.id === id ? {...row, detail: value} : row
      })}
    });
  }

  const toggleStarred = (thecase) => {
    setCases(prev => {
      return { ...prev, data: prev.data.map((row) => {
        return row.id === thecase.id ? {...row, starred: !row.starred} : row
      })}
    });
  }

  const toggleDetail = (thecase) => {
    if (thecase.detail) {
      setCaseDetail(thecase.id, null);
    } else {
      setCaseDetail(thecase.id, { loading: true });
      axios.get('http://localhost:8080/api/cases/' + thecase.id + '/detail')
        .then(response => setCaseDetail(thecase.id, { loading: false, data: response.data }))
        .catch(err => setCaseDetail(thecase.id, { loading: false, error: err }));
    }
  }
      
  const NoCases = () => (
    <div className="mt-5 text-center text-secondary">No, there are no cases of this kind.</div>
  )

  const FilteredOut = () => (
    <div className="mt-5 text-center text-secondary">Filtered out, try tweaking the knobs.</div>
  )

  const CaseActions = (props) => (
    <div className="pt-2 mr-3 float-right">
      <FontAwesomeIcon icon={props.thecase.starred ? faStar : faStarOutline} size="lg" 
        className={props.thecase.starred ? 'cursor-pointer text-success' : 'cursor-pointer'}
        onClick={() => toggleStarred(props.thecase)}/>
      <FontAwesomeIcon icon={props.thecase.detail ? faAngleUp : faAngleDown} size="lg" 
        className="ml-3 cursor-pointer"
        onClick={() => toggleDetail(props.thecase)}/>
    </div>
  )

  const CaseDetail = props => {
    return !props.thecase.detail ? null :
      props.thecase.detail.loading ? <Loading /> :
      props.thecase.detail.error ? <LoadingError /> : (
      <div className="col-md-12 pt-3 text-secondary">
        { props.thecase.detail.data.map(n => 
          <CaseDetailProperty name={n.name} value={n.value} key={n.id} />) }
      </div>
    )
  }

  const CaseDetailProperty = props => (
    <Row>
      <Col md={4}>{props.name}</Col>
      <Col className="text-primary">{props.value}</Col>
    </Row>
  )

  const CaseRow = (props) => (
    <div className="p-2 pl-3 mb-1 bg-white text-dark">
      <CaseActions thecase={props.thecase} />
      <div className="cursor-pointer col-md-10" 
        onClick={() => navigate('/cases/' + modelId + '/' + props.thecase.id)}>
        <h5 className="text-primary">{props.thecase.name}</h5>
        <div className="text-secondary">{props.thecase.description ? props.thecase.description : 'No description.'}</div>
      </div>
      <CaseDetail thecase={props.thecase} />
    </div>
  )

  const Cases = (props) => {
    const filtered = props.cases
      .filter(c => filter.starred ? c.starred : true)
      .filter(c => filter.commented ? c.commented : true)
      .map(c => <CaseRow thecase={c} key={c.id} />);
    return filtered.length > 0 ? filtered : 
      (props.cases.length != filtered.length) ? <FilteredOut /> : 
      <NoCases />
  }

  return (
    <Container className="pt-4">
      <h4 className="text-muted font-weight-light text-uppercase mb-4">
        <FontAwesomeIcon icon={faPlus} className="mr-2 float-right cursor-pointer text-success"
          onClick={() => console.log("Add")}/>
        <FontAwesomeIcon icon={filter.starred ? faStar : faStarOutline} 
          className="mr-4 float-right"
          onClick={() => setFilter({ ...filter, starred: !filter.starred })} />
        <FontAwesomeIcon icon={filter.commented ? faComment : faCommentOutline} 
          className="mr-4 float-right"
          onClick={() => setFilter({ ...filter, commented: !filter.commented })} />
        { models.data && models.byId[modelId] ? models.byId[modelId].name + 's' : '' }
      </h4>
      {
        models.loading || cases.loading ? <Loading /> : 
        models.error || cases.error ? <LoadingError error = { models.error }/> :  
        models.byId[modelId] && cases.data ? <Cases cases={cases.data}/> : 
        <NoCases />
      }
    </Container>  
  )
};

export default CasesPage;



