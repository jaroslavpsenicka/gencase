import React from 'react';

const LoadingError = (props) => (
  <div className="mt-5 text-center text-secondary">Oops, something went wrong: {JSON.stringify(props.error)}.</div>  
)

export default LoadingError;   