import React from 'react';

const RewindIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path d="M11 18V6l-8.5 6 8.5 6zm-1.5-6l6-4.5v9l-6-4.5zM20 6l-8.5 6 8.5 6V6z"/>
  </svg>
);

export default RewindIcon;
