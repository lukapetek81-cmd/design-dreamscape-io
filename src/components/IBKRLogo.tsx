import React from 'react';

interface IBKRLogoProps {
  className?: string;
  variant?: 'default' | 'white';
}

export const IBKRLogo: React.FC<IBKRLogoProps> = ({ className = "h-8 w-auto", variant = 'default' }) => {
  return (
    <img 
      src="/lovable-uploads/0e398cf7-f95a-4022-b977-3a14a6c26906.png" 
      alt="Interactive Brokers" 
      className={`${className} ${variant === 'white' ? 'filter brightness-0 invert' : ''}`}
    />
  );
};