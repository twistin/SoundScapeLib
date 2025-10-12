import React from 'react';

const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        {...props}
    >
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M9.594 3.94c.09-.542.56-1.007 1.113-1.113l.448-.112c.542-.136 1.122.035 1.487.448l.387.387c.28.28.67.42 1.065.42h.448c.45 0 .848.162 1.13.448l.387.387c.352.352.584.823.448 1.34l-.112.448c-.106.522-.57.975-1.113 1.113l-.448.112c-.542.136-1.122-.035-1.487-.448l-.387-.387a1.05 1.05 0 01-.42-1.065v-.448a1.05 1.05 0 01.448-1.13l-.387-.387a1.05 1.05 0 01-.448-1.487l.112-.448zM12 6.75a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5zM12 15a3 3 0 110-6 3 3 0 010 6z" 
        />
    </svg>
);

export default SettingsIcon;
