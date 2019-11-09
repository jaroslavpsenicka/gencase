import React from 'react';

const Loading = (props) => (
  <div className="mt-5 text-center text-secondary">{ props.text ? props.text : 'Loading...'}</div>
)

export default Loading;