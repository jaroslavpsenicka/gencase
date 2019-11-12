import React from 'react';

const Loading = ({text}) => (
  <div className="mt-5 text-center text-secondary">{ text ? text : 'Loading...'}</div>
)

export default Loading;