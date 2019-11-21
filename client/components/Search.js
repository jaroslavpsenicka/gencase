import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';

const Search = () => (
  <div className="mt-5 mb-5 offset-md-2 col-md-8">
    <InputGroup size="lg" className="mb-3">
      <FormControl placeholder="Hit  &#9166;  to search" aria-label="search" autoFocus />
    </InputGroup>
  </div>
)

export default Search;