import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CustomerPortal from '@/components/CustomerPortal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const Billing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <Card className="p-6 sm:p-8 text-center mobile-card">
            <h1 className="text-xl sm:text-2xl font-bold mb-4">Billing & Subscription</h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">Please sign in to view your billing information.</p>
            <Button 
              onClick={() => navigate('/auth')}
              className="mobile-button w-full sm:w-auto"
            >
              Sign In
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Billing & Subscription</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your subscription, view invoices, and update billing information.</p>
        </div>
        
        <CustomerPortal />
      </div>
    </div>
  );
};

export default Billing;