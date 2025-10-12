import React from 'react';

const LoadingWaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        version="1.1" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        {...props}
    >
        <rect x="1" y="6" width="2.8" height="12" opacity="0.2">
            <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0s" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="height" attributeType="XML" values="12; 20; 12" begin="0s" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="y" attributeType="XML" values="6; 2; 6" begin="0s" dur="0.8s" repeatCount="indefinite" />
        </rect>
        <rect x="6.6" y="6" width="2.8" height="12" opacity="0.2">
            <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.2s" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="height" attributeType="XML" values="12; 20; 12" begin="0.2s" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="y" attributeType="XML" values="6; 2; 6" begin="0.2s" dur="0.8s" repeatCount="indefinite" />
        </rect>
        <rect x="12.2" y="6" width="2.8" height="12" opacity="0.2">
            <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.4s" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="height" attributeType="XML" values="12; 20; 12" begin="0.4s" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="y" attributeType="XML" values="6; 2; 6" begin="0.4s" dur="0.8s" repeatCount="indefinite" />
        </rect>
        <rect x="17.8" y="6" width="2.8" height="12" opacity="0.2">
            <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.6s" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="height" attributeType="XML" values="12; 20; 12" begin="0.6s" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="y" attributeType="XML" values="6; 2; 6" begin="0.6s" dur="0.8s" repeatCount="indefinite" />
        </rect>
    </svg>
);

export default LoadingWaveIcon;
