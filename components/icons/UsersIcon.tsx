import React from 'react';

const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 00-12 0m12 0a9.094 9.094 0 00-12 0m12 0A9.094 9.094 0 0112 21.75a9.094 9.094 0 01-6-3.03m12 0v-2.07a9.094 9.094 0 00-6-8.636 9.094 9.094 0 00-6 8.636v2.07m12 0a9.094 9.094 0 00-6 3.03M12 21.75a9.094 9.094 0 00-6-3.03m6 3.03V18.72m0 3.03v-3.03m0-12a3 3 0 110-6 3 3 0 010 6z" />
  </svg>
);

export default UsersIcon;