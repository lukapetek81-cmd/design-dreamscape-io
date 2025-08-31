import React from 'react';
import { TradingDashboard } from '@/components/trading/TradingDashboard';
import SEOHead from '@/components/SEOHead';

const Trading: React.FC = () => {
  return (
    <>
      <SEOHead 
        title="Trading Dashboard - IBKR Integration"
        description="Professional trading dashboard with Interactive Brokers integration. Live market data, advanced order types, risk management, and comprehensive trading history."
        keywords={["IBKR trading", "Interactive Brokers", "commodity trading", "futures trading", "live market data", "trading dashboard"]}
      />
      <div className="min-h-screen bg-background">
        <TradingDashboard />
      </div>
    </>
  );
};

export default Trading;