
import React from 'react';

const WaveformIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 19.5l-15-15" strokeOpacity="0.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" strokeOpacity="0.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 15V9m3.75 6v-3m3.75 3V6.75m-11.25 8.25v-4.5m0 4.5h15" />
  </svg>
);

export default WaveformIcon;
