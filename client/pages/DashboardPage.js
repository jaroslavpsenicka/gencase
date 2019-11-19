import React from 'react';
import Container from 'react-bootstrap/Container';

const DashboardPage = () => {

  return (
    <Container className="pt-4">
      <div>All cases will be shown here.</div>
      <ul>
        <li>Search</li>
        <li>My cases</li>
        <li>My tasks</li>
        <li>Stats, such as graphs</li>
      </ul>
    </Container>  
  );

};

export default DashboardPage;
