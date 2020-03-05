import React, { useRef } from 'react';
import { faPlus, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Axios from 'axios';
import VagueTime from 'vague-time';

import Loading from './Loading';
import LoadingError from './LoadingError'
import { formatFileSize } from '../Formatters';

const SERVICE_URL = process.env.REACT_APP_SERVICE_URL || '';

const vagueTime = (time) => {
  return VagueTime.get({to: new Date(time)})
}

const Attachments = ({caseId, documents, setDocuments, documentsRef}) => {

  const inputDocumentRef = useRef(null); 

  const DocumentRow = ({document}) => (
    <Row className="p-2 mb-0 bg-white text-dark">
      <Col md={6} className="pl-2">
        <FontAwesomeIcon icon={faFilePdf}></FontAwesomeIcon>
        <span className="pl-2 text-primary font-weight-bold">{document.name}</span>
      </Col>
      <Col md={2} className="text-secondary text-right">{formatFileSize(document.size, 0)}</Col>
      <Col md={4} className="text-secondary text-right text-ellipsis pr-2">{vagueTime(document.createdAt)} by {document.createdBy}</Col>
    </Row>
  )

  const NoDocuments = () => (
    <div className="text-center text-secondary">No documents.</div>
  )

  const onUpload = (event) => {
    if (event.target.name === "file") {
      const formData = new FormData();
      formData.append('file', event.target.files[0], event.target.files[0].name);
      Axios.post(SERVICE_URL + '/api/cases/' + caseId + '/documents', formData)
        .then(resp => setDocuments({ loading: false, data: [...documents.data, resp.data]}))
        .catch(err => console.error(err));
      }
  }

  return (
    <div>
      <h5 className="pt-4" ref={documentsRef}>
        <input type="file" name="file" id="file" ref={inputDocumentRef} className="d-none" 
          onChange={(event) => onUpload(event)} />
        <FontAwesomeIcon icon={faPlus} className="mr-2 float-right cursor-pointer text-success"
          disabled = {documents.loading || documents.error}
          onClick = {() => inputDocumentRef.current.click()}/>
        Attachments
      </h5>
      <div className="px-3">
        {
          documents.loading ? <Loading /> : 
          documents.error ? <LoadingError error = { documents.error }/> :  
          documents.data && documents.data.size == 0 ? <NoDocuments /> :
          documents.data ? documents.data.map(d => <DocumentRow document={d} key={d.id}/>) : 
          <div />
        }
      </div>
    </div>  
  ); 

}

export default Attachments;