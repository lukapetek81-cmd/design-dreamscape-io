import React from 'react';

interface IBKRLogoProps {
  className?: string;
}

export const IBKRLogo: React.FC<IBKRLogoProps> = ({ className = "h-8 w-auto" }) => {
  return (
    <img 
      src="/lovable-uploads/c869cde6-8fa1-45c9-923e-bb43a1d8ebb1.png" 
      alt="Interactive Brokers" 
      className={className}
    />
  );
};