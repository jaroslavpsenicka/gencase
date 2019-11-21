import React from 'react';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import { faStar, faPlus, faSignal } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarOutline } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const DashboardPage = () => {

  const Search = () => (
    <div className="mt-5 mb-5 offset-md-2 col-md-8">
      <InputGroup size="lg" className="mb-3">
        <FormControl placeholder="type to search" aria-label="search" autoFocus />
      </InputGroup>
    </div>
  )

  const Chart = ({title, width}) => (
    <Col md={width} className="mb-3">
      <Col md={12} className="bg-white h-100px text-center text-secondary pt-5">{title}</Col>
    </Col>
  )

  return (
    <Container className="pt-4">
      <h4 className="w-100 text-muted font-weight-light text-uppercase mb-4 mr-3">
        <FontAwesomeIcon icon={faPlus} className="mr-2 float-right cursor-pointer"/>
        <FontAwesomeIcon icon={faStarOutline} className="mr-4 float-right cursor-pointer"/>
        <FontAwesomeIcon icon={faSignal} className="mr-4 float-right cursor-pointer"/>
        Dashboard
        <Search />
      </h4>
      <Row>
        <Chart title="Chart1" width="3"/>
        <Chart title="Chart2" width="9"/>
        <Chart title="Chart3" width="6"/>
        <Chart title="Chart4" width="2"/>
        <Chart title="Chart5" width="2"/>
        <Chart title="Chart5" width="2"/>
      </Row>


    </Container>
  );

};

export default DashboardPage;
