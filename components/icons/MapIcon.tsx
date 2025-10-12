import React from 'react';

const MapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m0 0v-8.25m0 8.25h3.75l-3.75-8.25h3.75m-3.75 8.25H3M3 15h3.75m0 0v-8.25m0 8.25L3 6.75h3.75m6.75-3v8.25h3.75m-3.75-8.25L15 15h3.75M15 15h3.75" />
  </svg>
);

export default MapIcon;
