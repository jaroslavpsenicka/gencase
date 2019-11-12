import React, { useState, useEffect, useRef, useContext } from 'react';
import ReactDOM from 'react-dom';
import { faStar, faComment, faFile, faPlus, faFilePdf } from '@fortawesome/free-solid-svg-icons'
import { 
  faStar as faStarOutline, 
  faComment as faCommentOutline, 
  faFile as faFileOutline } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import Loading from '../components/Loading';
import LoadingError from '../components/LoadingError'
import { CasesContext } from '../CasesContext';
import { byId } from '../ContextUtils';

const scrollToRef = (ref) => window.scrollTo(0, ref.current.offsetTop);   

const CaseDetailPage = ({modelId, id}) => {

  const [ cases, setCases, loadCases, loadCase ] = useContext(CasesContext);
  const [ showCommentDialog, setShowCommentDialog ] = useState(false);

  const commentsRef = useRef(null);
  const documentsRef = useRef(null);
  const inputDocumentRef = useRef(null); 

  useEffect(() => loadCase(id), [id]);

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

  const DocumentRow = (props) => (
    <Row className="p-2 mb-1 mr-2 bg-white text-dark">
      <Col md={7} className="pl-2">
        <FontAwesomeIcon icon={faFilePdf}></FontAwesomeIcon>
        <span className="pl-2 text-primary font-weight-bold">Agreement.pdf</span>
      </Col>
      <Col md={2} className="text-secondary">John Doe</Col>
      <Col md={2} className="text-secondary text-right">10.7 2019</Col>
      <Col md={1} className="text-secondary text-right pr-2">12K</Col>
    </Row>
  )

  const CommentRow = () => (
    <Row className="p-2 mb-1 mr-2 bg-white text-dark">
      <Col md={6} className="pl-2 text-primary font-weight-bold">John Doe</Col>
      <Col md={6} className="text-secondary text-right pr-2">13.6 2019</Col>
      <Col md={12} className="pl-2 pt-2 text-primary">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer convallis consequat semper. Suspendisse a dolor quis neque placerat rhoncus. Sed eu risus suscipit, vulputate lorem sit amet, sodales orci. Ut vitae arcu quis enim interdum luctus. Nam sed mauris id ipsum rhoncus mattis in ut augue. Nam vehicula vitae orci at aliquam. In hac habitasse platea dictumst. In hac habitasse platea dictumst. Ut tristique dignissim lacinia. Donec consequat id neque vel pellentesque. Nam ornare nisl eget mi eleifend dignissim. Pellentesque sed mi a quam sagittis interdum sed ac orci.</Col>
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
          onClick={() => inputDocumentRef.current.click()}/>
        Documents
      </h5>
      <Container>
        <DocumentRow />
      </Container>
    </div>  
  ) 

  const Comments = () => (
    <div>
      <CommentDialog />
      <h5 className="pt-4" ref={commentsRef}>
        <FontAwesomeIcon icon={faPlus} className="mr-4 float-right cursor-pointer text-success"
          onClick={() => setShowCommentDialog(true)}/>
        Comments
      </h5>
      <Container>
        <CommentRow />
        <CommentRow />
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