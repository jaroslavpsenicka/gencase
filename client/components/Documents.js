import React, { useRef } from 'react';
import { faPlus, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Loading from '../components/Loading';
import LoadingError from '../components/LoadingError'
import { formatFileSize } from '../Formatters';

const Documents = ({documents, documentsRef, dateFormat}) => {

  const inputDocumentRef = useRef(null); 

  const DocumentRow = ({document}) => (
    <Row className="p-2 mb-1 mr-2 bg-white text-dark">
      <Col md={6} className="pl-2">
        <FontAwesomeIcon icon={faFilePdf}></FontAwesomeIcon>
        <span className="pl-2 text-primary font-weight-bold">{document.name}</span>
      </Col>
      <Col md={2} className="text-secondary">{document.createdBy}</Col>
      <Col md={2} className="text-secondary text-right">{dateFormat.format(new Date(document.createdAt))}</Col>
      <Col md={2} className="text-secondary text-right pr-2">{formatFileSize(document.size, 0)}</Col>
    </Row>
  )

  const NoDocuments = () => (
    <div className="text-center text-secondary">No documents.</div>
  )

  const onDocumentUpload = () => {
  }

  return (
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
          documents.data && documents.data.size == 0 ? <NoDocuments /> :
          documents.data ? documents.data.map(d => <DocumentRow document={d} key={d.id}/>) : 
          <div />
        }
      </Container>
    </div>  
  ); 

}

export default Documents;