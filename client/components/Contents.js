import React from 'react';

import './Contents.css';

const Contents = (props) => (
  <div id="contents" className={props.withSidebar ? 
    'd-flex flex-column with-sidebar' : 
    'd-flex flex-column without-sidebar'}>
    {props.children}
  </div>
);

export default Contents;