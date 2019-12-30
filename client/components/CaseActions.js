import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { faCog, faPlayCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from 'react-bootstrap/Button';
import Axios from 'axios';

import Loading from '../components/Loading';
import LoadingError from '../components/LoadingError'

const SERVICE_URL = process.env.REACT_APP_SERVICE_URL || '';

const CaseActions = ({caseId, actions, setActions}) => {

  const [action, setAction] = useState({});
  const [actionDialog, setActionDialog] = useState(false);
  const [loadingOverlay, setLoadingOverlay] = useState(false);
  const [processingError, setProcessingError] = useState({ showDialog: false });

  const reloadActions = () => {
    setLoadingOverlay(false);
    Axios.get(SERVICE_URL + '/api/cases/' + caseId + '/actions')
    .then(response => setActions({ loading: false, data: response.data }))
    .catch(err => setActions({ loading: false, error: err }));
  }

  const showError = (err) => {
    setLoadingOverlay(false);
    setProcessingError({ showDialog: true, err: err.message ? err.message : 'unknown error' });
  }

  const performAction = () => {
    setActionDialog(false);
    setLoadingOverlay(true);
    if (action.cancel) {
      Axios.delete(SERVICE_URL + '/api/cases/' + caseId + '/actions/' + action.name)
      .then(() => reloadActions())
      .catch(err => showError(err))
    } else {
      Axios.post(SERVICE_URL + '/api/cases/' + caseId + '/actions/' + action.name)
      .then(() => reloadActions())
      .catch(err => showError(err))
    }
  }

  const ActionDialog = () => {
    const what = action.cancel ? 'cancel' : 'run';
    return (
      <Modal show={actionDialog} onHide={() => setActionDialog(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{action.label}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to {what} the {action.label}?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setActionDialog(false)}>No, keep everything as is</Button>
          <Button variant="danger" onClick={() => performAction()}>Yes, please</Button>
        </Modal.Footer>
      </Modal>
    );  
  }

  const LoadingOverlay = () => {
    const what = action.cancel ? 'Cancelling' : 'Initiating';
    return (
      <Modal size="lg" centered="true" show={loadingOverlay} onHide={() => {}}>
        <Modal.Body>
          <FontAwesomeIcon size="3x" icon={faCog} className="float-left ml-2 mr-4 p-2 fa-spin text-secondary"/>
          <div>{what} the {action.to} process.<br/>Please wait...</div>
        </Modal.Body>
      </Modal>
    )
  }

  const ErrorDialog = () => {
    const what = action.cancel ? 'cancel' : 'run';
    return (
      <Modal show={processingError.showDialog} onHide={() => setProcessingError({ showDialog: false })}>
        <Modal.Header closeButton>
          <Modal.Title>Problem with {action.to}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>There were an error performing the {action.to}.<br/>{processingError.err}.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setProcessingError({ showDialog: false })}>Close</Button>
        </Modal.Footer>
      </Modal>
    );  
  }

  return (
    <div className="ml-4 mb-2 float-right">
      <ActionDialog />
      <LoadingOverlay />
      <ErrorDialog />
      {
        actions.loading ? <Loading /> : 
        actions.error ? <LoadingError error = { comments.error }/> :  
        actions.data && actions.data.length > 0 ? actions.data.map(a => 
          <Button className={'ml-2 ' + (a.cancel ? 'btn-danger' : 'btn-primary')} key={a.name}
            onClick={() => { setAction(a); setActionDialog(true) }}>
            <FontAwesomeIcon icon={a.cancel ? faTimesCircle : faPlayCircle} className="mr-3 br-1 border-right-1"/>
            {a.cancel ? 'Cancel ' + a.label : 'Start ' + a.label}
          </Button>
        ) : <div />
      }
    </div>
  );

}

export default CaseActions;