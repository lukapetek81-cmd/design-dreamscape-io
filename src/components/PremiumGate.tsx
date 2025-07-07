import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PremiumGateProps {
  children: React.ReactNode;
  requiresPremium?: boolean;
  fallback?: React.ReactNode;
  feature?: string;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({ 
  children, 
  requiresPremium = false, 
  fallback,
  feature = "this feature"
}) => {
  const { isGuest, isPremium } = useAuth();

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

  // Show premium prompt if premium is required but user doesn't have it
  if (requiresPremium && !isPremium) {
    return fallback || (
      <Card className="p-6 text-center">
        <CardContent className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
            <Crown className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Premium Feature</h3>
            <p className="text-muted-foreground">
              Upgrade to Premium to access {feature}
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Link to="/billing">
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // User has access, show the content
  return <>{children}</>;
};