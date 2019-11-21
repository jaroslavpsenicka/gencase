import React, { forwardRef, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Dropdown from 'react-bootstrap/Dropdown';
import { faAngleDown, faPlus, faStar, faSignal } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarOutline, faCheckCircle } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Search from '../components/Search';
import AddChartDialog from '../components/AddChartDialog';

const ChartToggle = forwardRef(({ children, onClick }, ref) => (
  <a href="" ref={ref} onClick={e => {
      e.preventDefault();
      onClick(e);
    }}
  >
    {/* Render custom icon here */}
    <FontAwesomeIcon icon={faAngleDown} className='cursor-pointer text-dark' />
    {children}
  </a>
));

const DashboardPage = () => {

  const [showAddChartDialog, setShowAddChartDialog] = useState(false);
  const [showCharts, setShowCharts] = useState(true);

  const addGadget = () => {
    setShowAddChartDialog(false);
  }

  const ChartActions = (props) => (
    <div className="float-right cursor-pointer">
      <Dropdown>
        <Dropdown.Toggle as={ChartToggle}/>
        <Dropdown.Menu>
          <Dropdown.Item href="#/action-1">Edit</Dropdown.Item>
          <Dropdown.Item href="#/action-2">Update</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item href="#/action-3">Remove</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  )

  const Chart = ({title, width, children}) => (
    <Col md={width} className="mb-3">
      <Col md={12} className="bg-white h-100px pt-1 text-secondary">
        <ChartActions/>
        <div className="mr-3 text-ellipsis">{title}</div>
        {children}
      </Col>
    </Col>
  )

  const Charts = () => (
    <Row>
      <Chart title="Cases today" width="4">
        <h4 className="text-center text-dark pt-4 cursor-move">174/137</h4>
      </Chart>  
      <Chart title="Cases this week" width="4">
        <h4 className="text-center text-dark pt-4 cursor-move">591/346</h4>
      </Chart>  
      <Chart title="Cases this month" width="4">
        <h4 className="text-center text-dark pt-4 cursor-move">1267/467</h4>
      </Chart>  
      <Chart title="Failures and timeouts" width="6"/>
      <Chart title="DB" width="2">
        <h4 className="text-center text-dark pt-4 cursor-move text-success">
          <FontAwesomeIcon icon={faCheckCircle} className="text-success"/>
        </h4>
      </Chart>
      <Chart title="ES" width="2">
      <h4 className="text-center text-dark pt-4 cursor-move text-success">
          <FontAwesomeIcon icon={faCheckCircle} className="text-success"/>
        </h4>
      </Chart>
      <Chart title="SC" width="2">
        <h4 className="text-center text-dark pt-4 cursor-move">
          <FontAwesomeIcon icon={faCheckCircle} className="text-success"/>
        </h4>
      </Chart>
    </Row>
  )

  return (
    <Container className="pt-4">
      <h4 className="text-muted font-weight-light text-uppercase mb-4">
        <FontAwesomeIcon icon={faPlus} 
          className="mr-2 cursor-pointer text-success float-right"
          onClick={() => setShowAddChartDialog(true)}/>
        <FontAwesomeIcon icon={faStarOutline} 
          className="mr-4 cursor-pointer float-right"/>
        <FontAwesomeIcon icon={faSignal} 
          className={ showCharts ? "mr-4 float-right cursor-pointer text-success" : "mr-4 float-right cursor-pointer" }
          onClick={() => setShowCharts(!showCharts)} />
        Dashboard
      </h4>
      <AddChartDialog show={showAddChartDialog} 
        onAdd={() => addGadget()} 
        onCancel={() => setShowAddChartDialog(false)}/>
      <Search />
      { showCharts ? <Charts /> : <div />}
    </Container>
  );

};

export default DashboardPage;
