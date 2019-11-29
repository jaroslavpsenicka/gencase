import React, { useState, useEffect, useRef, useContext } from 'react';
import { faStar, faComment, faFile, faPlus, faFilePdf } from '@fortawesome/free-solid-svg-icons'
import { 
  faStar as faStarOutline, 
  faComment as faCommentOutline, 
  faFile as faFileOutline } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Axios from 'axios';

import Loading from '../components/Loading';
import LoadingError from '../components/LoadingError'
import { byId } from '../ContextUtils';
import Documents from '../components/Documents';
import Comments from '../components/Comments';

const scrollToRef = (ref) => window.scrollTo(0, ref.current.offsetTop);   

const CaseDetailPage = ({modelId, id}) => {

  const [ theCase, setTheCase ] = useState({ loading: true });
  const [ documents, setDocuments ] = useState({ loading: true });
  const [ comments, setComments ] = useState({ loading: true });

  const commentsRef = useRef(null);
  const documentsRef = useRef(null);
  const DateFormat = Intl.DateTimeFormat({ dateStyle: 'short' });

  useEffect(() => {
    Axios.get('http://localhost:8080/api/cases/' + id)
      .then(response => setTheCase({ loading: false, data: response.data }))
      .catch(err => setTheCase({ loading: false, error: err }))
  }, [id]);
  useEffect(() => {
    Axios.get('http://localhost:8080/api/cases/' + id + '/documents')
      .then(response => setDocuments({ loading: false, data: response.data }))
      .catch(err => setDocuments({ loading: false, error: err }))
  }, [id]);
  useEffect(() => {
    Axios.get('http://localhost:8080/api/cases/' + id + '/comments')
      .then(response => setComments({ loading: false, data: response.data }))
      .catch(err => setComments({ loading: false, error: err }))
  }, [id]);

  const updateData = (prev, id) => {
    return prev.data.map(row => {
      return row.id === id ? {...row, starred: !row.starred} : row 
    })
  }

  const toggleStarred = (toggledCase) => {
    Axios.put('http://localhost:8080/api/cases/' + theCase.data.id, { starred: !theCase.data.starred })
      .then(resp => setTheCase(prev => {
        return { ...prev, data: {...prev.data, starred: !prev.data.starred }}
      }))
      .catch(err => console.log('cannot star', toggledCase, err));
  }

  const CaseDetail = () => {
    return theCase.data.detail.map(k => 
      <CaseDetailProperty name={k.name} key={k.name} value={k.value}/>)
  }

  const CaseDetailProperty = ({name, value}) => (
    <>
      <Col md={4} lg={2} className="p-0 text-secondary">{name}:</Col>
      <Col md={8} lg={4} className="p-0 text-primary">{value}</Col>
    </>
  )

  const CaseActions = () => (
    <div className="ml-4 mb-2 float-right">
      <Button className="ml-2">Action</Button>
      <Button className="ml-2">Action</Button>
      <Button className="ml-2">Action</Button>
    </div>
  );

  const Case = () => (
    <div>
      <h4 className="text-muted font-weight-light text-uppercase">
        <FontAwesomeIcon icon={theCase.data.starred ? faStar : faStarOutline} 
          className={ theCase.data.starred ? "text-success ml-4 float-right cursor-pointer" : 
            "ml-4 float-right cursor-pointer" }
          onClick={() => toggleStarred()}/>
        <FontAwesomeIcon icon={theCase.data.commented ? faComment : faCommentOutline} 
          className="ml-4 float-right cursor-pointer text-success" 
          onClick={() => scrollToRef(commentsRef)}/>
        <FontAwesomeIcon icon={theCase.data.documents ? faFile : faFileOutline} 
          className="ml-4 float-right cursor-pointer text-success" 
          onClick={() => scrollToRef(documentsRef)}/>
        { theCase.data.name }
      </h4>
      <h5 className="mb-4">
        <Badge variant="secondary">{theCase.data.state}</Badge>
      </h5>
      <div className="mb-2 mh-50px">
        <CaseActions />
        <div>{theCase.data.description}</div>
      </div>
      <Row className="p-2 pl-3 mb-1 ml-0 mr-0 mt-3 bg-white text-dark">
        <CaseDetail />
      </Row>
      <Documents documents={documents} 
        documentsRef={documentsRef} 
        dateFormat={DateFormat} />
      <Comments comments={comments} 
        commentsRef={commentsRef} 
        dateFormat={DateFormat} />
    </div>    
  )

  return (
    <Container className="pt-4 mr-4">
      {
        theCase.loading ? <Loading /> : 
        theCase.error ? <LoadingError error = { theCase.error }/> :  
        theCase.data ? <Case /> : 
        <div />
      }
    </Container>
  )
}

export default CaseDetailPage;