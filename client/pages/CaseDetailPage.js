import React, { useState, useEffect, useRef, useContext } from 'react';
import ReactDOM from 'react-dom';
import { faStar, faComment, faFile, faPlus, faFilePdf } from '@fortawesome/free-solid-svg-icons'
import { 
  faStar as faStarOutline, 
  faComment as faCommentOutline, 
  faFile as faFileOutline } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Axios from 'axios';

import Loading from '../components/Loading';
import LoadingError from '../components/LoadingError'
import { CasesContext } from '../CasesContext';
import { byId } from '../ContextUtils';
import { formatFileSize } from '../Formatters';

const scrollToRef = (ref) => window.scrollTo(0, ref.current.offsetTop);   

const CaseDetailPage = ({modelId, id}) => {

  const [ cases, setCases, loadCases, loadCase ] = useContext(CasesContext);
  const [ showCommentDialog, setShowCommentDialog ] = useState(false);
  const [ documents, setDocuments ] = useState({ loading: true });
  const [ comments, setComments ] = useState({ loading: true });

  const commentsRef = useRef(null);
  const documentsRef = useRef(null);
  const inputDocumentRef = useRef(null); 

  const DateFormat = Intl.DateTimeFormat({ dateStyle: 'short' });

  useEffect(() => loadCase(id), [id]);
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

  const updateData = (prev, thecase) => {
    return prev.data.map(row => {
      return row.id === thecase.id ? {...row, starred: !row.starred} : row 
    })
  }

  const toggleStarred = (thecase) => {
    Axios.put('http://localhost:8080/api/cases/' + thecase.id, { starred: !thecase.starred })
      .then(resp => setCases(prev => {
        const data = updateData(prev, thecase);
        return { ...prev, data: data, byId: byId(data)}}))
      .catch(err => console.log('cannot star', thecase, err));
  }

  const onDocumentUpload = () => {
  }

  const DocumentRow = ({document}) => (
    <Row className="p-2 mb-1 mr-2 bg-white text-dark">
      <Col md={6} className="pl-2">
        <FontAwesomeIcon icon={faFilePdf}></FontAwesomeIcon>
        <span className="pl-2 text-primary font-weight-bold">{document.name}</span>
      </Col>
      <Col md={2} className="text-secondary">{document.createdBy}</Col>
      <Col md={2} className="text-secondary text-right">{DateFormat.format(new Date(document.createdAt))}</Col>
      <Col md={2} className="text-secondary text-right pr-2">{formatFileSize(document.size, 0)}</Col>
    </Row>
  )

  const CommentRow = ({comment}) => (
    <Row className="p-2 mb-1 mr-2 bg-white text-dark">
      <Col md={6} className="pl-2 text-primary font-weight-bold">{comment.createdBy}</Col>
      <Col md={6} className="text-secondary text-right pr-2">{DateFormat.format(new Date(comment.createdAt))}</Col>
      <Col md={12} className="pl-2 pt-2 text-primary">{comment.text}</Col>
    </Row>
  )

  const CommentDialog = () => (
    <Modal show={showCommentDialog} onHide={() => setShowCommentDialog(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Comment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="exampleForm.ControlTextarea1">
            <Form.Control as="textarea" rows="3" autoFocus />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => setShowCommentDialog(false)}>
          Add Comment
        </Button>
      </Modal.Footer>
    </Modal>
  )

  const Overview = () => (
    <div className="pt-4">Here comes the case overview.</div>
  )

  const Documents = () => (
    <div>
      <h5 className="pt-4" ref={documentsRef}>
        <input type="file" name="file" id="file" ref={inputDocumentRef} className="d-none" 
          onChange={(event) => onDocumentUpload(event)} />
        <FontAwesomeIcon icon={faPlus} className="mr-4 float-right cursor-pointer text-success"
          disabled = {documents.loading || documents.error}
          onClick = {() => inputDocumentRef.current.click()}/>
        Documents
      </h5>
      <Container>
        {
          documents.loading ? <Loading /> : 
          documents.error ? <LoadingError error = { documents.error }/> :  
          documents.data ? documents.data.map(d => <DocumentRow document={d} key={d.id}/>) : 
          <div />
        }
      </Container>
    </div>  
  ) 

  const Comments = () => (
    <div>
      <CommentDialog />
      <h5 className="pt-4" ref={commentsRef}>
        <FontAwesomeIcon icon={faPlus} className="mr-4 float-right cursor-pointer text-success"
          disabled = {comments.loading || comments.error}
          onClick={() => setShowCommentDialog(true)}/>
        Comments
      </h5>
      <Container>
        {
          comments.loading ? <Loading /> : 
          comments.error ? <LoadingError error = { comments.error }/> :  
          comments.data ? comments.data.map(d => <CommentRow comment={d} key={d.id}/>) : 
          <div />
        }
      </Container>
    </div>
  )

  const Case = ({theCase}) => {
    return (
      <div>
        <h4 className="text-muted font-weight-light text-uppercase mb-4">
          <FontAwesomeIcon icon={theCase.starred ? faStar : faStarOutline} 
            className={ theCase.starred ? "text-success mr-4 float-right cursor-pointer" : 
              "mr-4 float-right cursor-pointer" }
            onClick={() => toggleStarred(theCase)}/>
          <FontAwesomeIcon icon={theCase.commented ? faComment : faCommentOutline} 
            className="mr-4 float-right cursor-pointer" 
            onClick={() => scrollToRef(commentsRef)}/>
          <FontAwesomeIcon icon={theCase.documents ? faFile : faFileOutline} 
            className="mr-4 float-right cursor-pointer" 
            onClick={() => scrollToRef(documentsRef)}/>
          { theCase.name }
        </h4>
        <div>{theCase.description}</div>
        <Overview />
        <Documents />
        <Comments />
      </div>    
    )
  }

  return (
    <Container className="pt-4">
      {
        cases.loading ? <Loading /> : 
        cases.error ? <LoadingError error = { cases.error }/> :  
        cases.data ? <Case theCase={cases.byId[id]}/> : 
        <div />
      }
    </Container>
  )
}

export default CaseDetailPage;