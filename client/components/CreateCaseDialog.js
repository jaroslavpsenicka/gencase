import React, { useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const CreateCaseDialog = ({serviceUrl, model, show, onSubmit, onCancel}) => {

  const createServiceUrl = () => {
    return serviceUrl
      .replace("/cases", "/api/models")
      .replace("8081", "8080") + "/cases";      
  }

  const createCurl = () => {
    const data = {};
    listRequiredAttributes().forEach(a => data[a.name] = a.name);
    return "curl -X POST " + createServiceUrl() + " -H \"Content-Type: application/json\" -d '" + 
      JSON.stringify(data) + "'";
  }

  const listRequiredAttributes = () => {
    if (model) {
      const initialPhase = model.spec.phases.find(p => p.initial);			
      if (initialPhase) {
        const entity = model.spec.entities.find(e => e.name == "");
        if (entity) {
          return entity.attributes.filter(a => a.notEmpty);
        }
      }
    }

    return [];
  }

  return (
    <Modal size="lg" show={show} onHide={onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Create Case</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>This is mostly backend service, to create a case, you need to issue a REST 
          call to the following URL:</p>
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