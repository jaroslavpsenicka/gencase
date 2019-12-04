import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Axios from 'axios';

import Loading from '../components/Loading';
import LoadingError from '../components/LoadingError'

const CaseActions = ({caseId, actions, setActions}) => {

  const [action, setAction] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  const reloadActions = () => {
    Axios.get('http://localhost:8080/api/cases/' + caseId + '/actions')
    .then(response => setActions({ loading: false, data: response.data }))
    .catch(err => setActions({ loading: false, error: err }));
  }

  const performAction = () => {
    setShowConfirmation(false);
    if (action.cancel) {
      Axios.delete('http://localhost:8080/api/cases/' + caseId + '/transitions/' + action.name)
      .then(response => reloadActions())
      .catch(err => console.log('Action error', err))
    } else {
      Axios.post('http://localhost:8080/api/cases/' + caseId + '/actions/' + action.name)
      .then(response => reloadActions())
      .catch(err => console.log('Action error', err))
    }
  }

  const ActionDialog = () => {
    const text = action.cancel ? 'cancel' : 'run';
    return (
      <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{action.label}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to {text} the {action.to}?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmation(false)}>No, keep everything as is</Button>
          <Button variant="danger" onClick={() => performAction()}>Yes, please</Button>
        </Modal.Footer>
      </Modal>
    );  
  }

  return (
    <div className="ml-4 mb-2 float-right">
      <ActionDialog />
      {
        actions.loading ? <Loading /> : 
        actions.error ? <LoadingError error = { comments.error }/> :  
        actions.data && actions.data.length > 0 ? actions.data.map(a => 
          <Button className={'ml-2 ' + (a.cancel ? 'btn-warning' : 'btn-primary')} key={a.name}
            onClick={() => { setAction(a); setShowConfirmation(true) }}>{a.label}</Button>
        ) : <div />
      }
    </div>
  );

}

export default CaseActions;