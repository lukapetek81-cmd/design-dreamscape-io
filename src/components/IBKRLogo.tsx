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
      {/* Interactive Brokers actual brand colors - Red and Black */}
      <rect
        x="5"
        y="8"
        width="38"
        height="34"
        rx="4"
        fill="#DC2626"
        stroke="#1F2937"
        strokeWidth="2"
      />
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fontSize="16"
        fontWeight="bold"
        fill="#FFFFFF"
      >
        IB
      </text>
      <text
        x="52"
        y="18"
        fontSize="11"
        fontWeight="700"
        fill="#1F2937"
      >
        INTERACTIVE
      </text>
      <text
        x="52"
        y="32"
        fontSize="11"
        fontWeight="700"
        fill="#DC2626"
      >
        BROKERS
      </text>
    </svg>
  );
};