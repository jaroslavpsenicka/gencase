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
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Axios from 'axios';
import VagueTime from 'vague-time';

import Loading from '../components/Loading';
import LoadingError from '../components/LoadingError'
import { byId } from '../ContextUtils';

const vagueTime = (time) => {
  return VagueTime.get({to: new Date(time)})
}

const Comments = ({comments, commentsRef, dateFormat}) => {

  const [ showCommentDialog, setShowCommentDialog ] = useState(false);

  const CommentRow = ({comment}) => (
    <Row className="p-2 mb-1 bg-white text-dark">
      <Col md={6} className="pl-2 text-primary font-weight-bold">{comment.createdBy}</Col>
      <Col md={6} className="text-secondary text-right pr-2">{vagueTime(comment.createdAt)}</Col>
      <Col md={12} className="pl-2 pt-2 text-primary">{comment.text}</Col>
    </Row>
  )

  const NoComments = () => (
    <div className="text-center text-secondary">No comments.</div>
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

  return (
    <div>
      <CommentDialog />
      <h5 className="pt-4" ref={commentsRef}>
        <FontAwesomeIcon icon={faPlus} className="mr-2 float-right cursor-pointer text-success"
          disabled = {comments.loading || comments.error}
          onClick={() => setShowCommentDialog(true)}/>
        Comments
      </h5>
      <div className="px-3">
        {
          comments.loading ? <Loading /> : 
          comments.error ? <LoadingError error = { comments.error }/> :  
          comments.data && comments.data.length == 0 ? <NoComments /> :
          comments.data ? comments.data.map(d => <CommentRow comment={d} key={d.id}/>) : 
          <div />
        }
      </div>
    </div>
  );

}

export default Comments;