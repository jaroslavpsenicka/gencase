import React, { useState, useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Badge from 'react-bootstrap/Badge';
import { faStar, faAngleDown, faAngleUp, faPlus, faComment } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarOutline, faComment as faCommentOutline} from '@fortawesome/free-regular-svg-icons'
import Axios from 'axios'
import { navigate } from 'hookrouter';

import { ModelsContext } from '../ModelsContext';
import { CasesContext } from '../CasesContext';
import { byId } from '../ContextUtils';

import Loading from '../components/Loading';
import LoadingError from '../components/LoadingError';
import Search from '../components/Search';
import CreateCaseDialog from '../components/CreateCaseDialog'

const SERVICE_URL = process.env.REACT_APP_SERVICE_URL || '';

const CasesPage = ({modelId}) => {

  const [ models ] = useContext(ModelsContext);
  const [ cases, setCases, loadCases ] = useContext(CasesContext);
  const [ filter, setFilter ] = useState({ starred: false, commented: false });
  const [ showCreateCaseDialog, setShowCreateCaseDialog] = useState(false);

  useEffect(() => loadCases(modelId), [modelId]);

  const setCaseOverview = (id, value) => {
    setCases(prev => { 
      return { ...prev, data: prev.data.map((row) => {
        return row.id === id ? {...row, overview: value} : row
      })}
    });
  }

  const updateData = (prev, thecase) => {
    return prev.data.map(row => {
      return row.id === thecase.id ? {...row, starred: !row.starred} : row 
    })
  }

  const toggleStarred = (thecase) => {
    Axios.put(SERVICE_URL + '/api/cases/' + thecase.id + '/metadata', { starred: !thecase.starred })
    .then(resp => setCases(prev => {
      const data = updateData(prev, thecase);
      return { ...prev, data: data, byId: byId(data)}}))
    .catch(err => console.log('cannot star', thecase, err));
  }

  const toggleOverview = (thecase) => {
    if (thecase.overview) {
      setCaseOverview(thecase.id, null);
    } else {
      setCaseOverview(thecase.id, { loading: true });
      Axios.get(SERVICE_URL + '/api/cases/' + thecase.id + '/overview')
        .then(response => setCaseOverview(thecase.id, { loading: false, data: response.data }))
        .catch(err => setCaseOverview(thecase.id, { loading: false, error: err }));
    }
  }
      
  const NoCases = () => (
    <div className="mt-5 text-center text-secondary">No, there are no cases of this kind.</div>
  )

  const FilteredOut = () => (
    <div className="mt-5 text-center text-secondary">Filtered out, try tweaking the knobs.</div>
  )

  const CaseStateAndActions = ({theCase}) => (
    <Row className="mr-2 float-right">
      <h5 className="ml-3"><Badge variant="secondary">{theCase.state}</Badge></h5>
      <FontAwesomeIcon icon={theCase.starred ? faStar : faStarOutline} size="lg" 
        className={theCase.starred ? 'cursor-pointer ml-3 text-success' : 'cursor-pointer ml-3'}
        onClick={() => toggleStarred(theCase)}/>
      <FontAwesomeIcon icon={theCase.overview ? faAngleUp : faAngleDown} size="lg" 
        className="ml-3 cursor-pointer"
        onClick={() => toggleOverview(theCase)}/>
    </Row>
  )

  const CaseOverview = ({theCase}) => {
    return !theCase.overview ? null :
      theCase.overview.loading ? <Loading /> :
      theCase.overview.error ? <LoadingError /> : (
      <div className="pt-3 text-secondary">
        { theCase.overview.data.map(n => 
          <CaseOverviewProperty name={n.name} value={n.value} key={n.name} />) }
      </div>
    )
  }

  const CaseOverviewProperty = ({name, value}) => (
    <Row>
      <Col md={4}>{name}</Col>
      <Col className="text-primary">{value}</Col>
    </Row>
  )

  const CaseRow = ({theCase}) => (
    <div className="p-2 pl-3 mb-1 bg-white text-dark">
      <CaseStateAndActions theCase={theCase} />
      <div className="cursor-pointer" 
        onClick={() => navigate('/cases/' + modelId + '/' + theCase.id)}>
        <h5 className="text-primary text-ellipsis pr-3 mr-5">{theCase.name}</h5>
        <div className="text-secondary">{theCase.description ? theCase.description : 'No description.'}</div>
      </div>
      <CaseOverview theCase={theCase} />
    </div>
  )

  const Cases = (props) => {
    const filtered = props.cases
      .filter(c => filter.starred ? c.starred : true)
      .filter(c => filter.commented ? c.commented : true)
      .map(c => <CaseRow theCase={c} key={c.id} />);
    return filtered.length > 0 ? filtered : 
      (props.cases.length != filtered.length) ? <FilteredOut /> : 
      <NoCases />
  }
  
  return (
    <Container className="pt-4">
      <h4 className="text-muted font-weight-light text-uppercase mb-4">
        <FontAwesomeIcon icon={faPlus} className="mr-2 float-right cursor-pointer text-success"
          onClick={() => setShowCreateCaseDialog(true)}/>
        <FontAwesomeIcon icon={filter.starred ? faStar : faStarOutline} 
          className="mr-4 float-right"
          onClick={() => setFilter({ ...filter, starred: !filter.starred })} />
        <FontAwesomeIcon icon={filter.commented ? faComment : faCommentOutline} 
          className="mr-4 float-right"
          onClick={() => setFilter({ ...filter, commented: !filter.commented })} />
        { models.data && models.byId[modelId] ? models.byId[modelId].name + 's' : '' }
      </h4>
      <Search/>
      <CreateCaseDialog 
        serviceUrl={window.location.href} 
        show={showCreateCaseDialog}  
        model={models.data ? models.byId[modelId] : undefined} 
        onSubmit={() => setShowCreateCaseDialog(false)}
        onCancel={() => setShowCreateCaseDialog(false)}/>
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



