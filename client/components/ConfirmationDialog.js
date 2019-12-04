import React, { useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const ConfirmationDialog = ({title, text, show, onConfirm, onCancel}) => {

  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{text}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={onConfirm}>Confirm</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ConfirmationDialog;