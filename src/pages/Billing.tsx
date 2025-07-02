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
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Billing & Subscription</h1>
          <p className="text-muted-foreground mb-6">Please sign in to view your billing information.</p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription, view invoices, and update billing information.</p>
      </div>
      
      <CustomerPortal />
    </div>
  );
};

export default Billing;