import React from 'react';

const LoadingError = ({ error }) => (
  <div className="mt-5 mb-3 text-center text-secondary">Oops, {error.message}.</div>  
)

export default LoadingError;   