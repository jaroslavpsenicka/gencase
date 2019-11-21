import React, { forwardRef, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const AddChartDialog = ({show, onAdd, onCancel}) => (
  <Modal show={show} onHide={onCancel}>
    <Modal.Header closeButton>
      <Modal.Title>Add Gadget</Modal.Title>
    </Modal.Header>
    <Modal.Body>
    <Form>
    <Form.Group as={Row}>
        <Form.Label column sm={3}>Label</Form.Label>
        <Col sm={9}>
          <Form.Control type="text" autoFocus/>
        </Col>
      </Form.Group>
      <Form.Group as={Row}>
        <Form.Label column sm={3}>Type</Form.Label>
        <Col sm={9}>
          <Form.Control as="select">
            <option>Cases today</option>
            <option>Cases this week</option>
            <option>Cases this month</option>
            <option>Failures and timeouts</option>
            <option>health ckeck DB</option>
            <option>health check ES</option>
            <option>Health check SC</option>
            <option>Response time avg</option>
            <option>Response time max</option>
            <option>Response time max</option>
          </Form.Control>
        </Col>
      </Form.Group>
    </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      <Button variant="primary" onClick={onAdd}>Add Gadget</Button>
    </Modal.Footer>
  </Modal>
)

export default AddChartDialog;