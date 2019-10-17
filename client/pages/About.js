import React from 'react';
import { useTitle } from 'hookrouter';

const About = () => {
	useTitle('About');

  return (
    <div>This is simple case management application.<br />
      <a href="mailto:@jaroslav.psenicka@gmail.com">Contact me</a>, if you like.
    </div>
  )
}

export default About;
