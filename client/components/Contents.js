import React from 'react';
import styled from 'styled-components';

const StyledContentsWithSidebar = styled.div`
  margin-left: 200px;
`
const StyledContentsWithoutSidebar = styled.div`
  margin-left: 0px;
`

const Contents = ({ withSidebar, children }) => {
  return withSidebar ? 
    <StyledContentsWithSidebar className="d-flex flex-column">{children}</StyledContentsWithSidebar> :
    <StyledContentsWithoutSidebar className="d-flex flex-column">{children}</StyledContentsWithoutSidebar>
}

export default Contents;