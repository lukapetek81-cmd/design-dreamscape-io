import React from 'react';

interface IBKRLogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export const IBKRLogo: React.FC<IBKRLogoProps> = ({ className = "h-8 w-auto", variant = 'dark' }) => {
  return (
    <svg
      viewBox="0 0 200 50"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Interactive Brokers styled logo */}
      <rect
        x="5"
        y="10"
        width="35"
        height="30"
        rx="3"
        fill={variant === 'light' ? '#ffffff' : '#1e3a8a'}
        stroke={variant === 'light' ? '#1e3a8a' : '#ffffff'}
        strokeWidth="1"
      />
      <text
        x="22"
        y="28"
        textAnchor="middle"
        fontSize="14"
        fontWeight="bold"
        fill={variant === 'light' ? '#1e3a8a' : '#ffffff'}
      >
        IB
      </text>
      <text
        x="50"
        y="20"
        fontSize="12"
        fontWeight="600"
        fill={variant === 'light' ? '#1e3a8a' : '#374151'}
      >
        Interactive
      </text>
      <text
        x="50"
        y="35"
        fontSize="12"
        fontWeight="600"
        fill={variant === 'light' ? '#1e3a8a' : '#374151'}
      >
        Brokers
      </text>
    </svg>
  );
};