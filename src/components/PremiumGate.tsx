import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PremiumGateProps {
  children: React.ReactNode;
  requiresPremium?: boolean;
  fallback?: React.ReactNode;
  feature?: string;
}

/**
 * Freemium model: Only gates content for guests (requires login).
 * Premium gating is disabled - all logged-in users have full access.
 */
export const PremiumGate: React.FC<PremiumGateProps> = ({ 
  children, 
  requiresPremium = false, 
  fallback,
  feature = "this feature"
}) => {
  const { isGuest } = useAuth();

  // Show login prompt if user is not logged in
  if (isGuest) {
    return fallback || (
      <Card className="p-6 text-center">
        <CardContent className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Login Required</h3>
            <p className="text-muted-foreground">
              Sign in to access {feature}
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Freemium model: All logged-in users have full access
  // Premium gating removed - requiresPremium is ignored
  return <>{children}</>;
};