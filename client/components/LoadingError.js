import React from 'react';

const LoadingError = ({ error }) => (
  <div className="mt-5 mb-3 text-center text-secondary">Oops, {error ? error.message : 'something went wrong'}.</div>  
)

export default LoadingError;   