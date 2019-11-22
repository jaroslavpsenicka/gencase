import React, { useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const CreateCaseDialog = ({serviceUrl, show, onSubmit, onCancel}) => {

  const createServiceUrl = () => {
    return serviceUrl
      .replace("/cases", "/api/cases")
      .replace("8081", "8080");
  }

  const createCurl = () => {
    return 'curl -X POST ' + createServiceUrl() + ' -d {}';
  }

  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Create Case</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>This is mostly backend service, to create a case, you need to issue a REST 
          request containing all mandatory fields to the following URL:</p>
        <pre>   {createServiceUrl()}</pre>  
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <CopyToClipboard text={createCurl()}>
          <Button variant="primary" onClick={onSubmit}>Copy curl</Button>
        </CopyToClipboard>
      </Modal.Footer>
    </Modal>
  )
}

export default CreateCaseDialog;