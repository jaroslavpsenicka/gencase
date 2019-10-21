import React from 'react';

import './Contents.css';

const Contents = (props) => (
  <div id="contents" className={props.withSidebar ? 'with-sidebar' : 'without-sidebar'}>
    {props.children}
  </div>
);

export default Contents;