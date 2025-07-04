import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Settings, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const { user, profile, signOut } = useAuth();

  if (!user || !profile) {
    return (
      <Link to="/auth">
        <Button variant="outline" size="sm" className="gap-2">
          <User className="w-4 h-4" />
          Sign In
        </Button>
      </Link>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isPremium = profile.subscription_active && profile.subscription_tier !== 'free';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 sm:h-8 sm:w-8 rounded-full mobile-touch-target">
          <Avatar className="h-10 w-10 sm:h-8 sm:w-8">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'User'} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(profile.full_name || profile.email)}
            </AvatarFallback>
          </Avatar>
          {isPremium && (
            <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-3 sm:h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border border-background flex items-center justify-center">
              <Crown className="w-2.5 h-2.5 sm:w-2 sm:h-2 text-white" />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 sm:w-56 mr-2 sm:mr-0" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex flex-col space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <p className="text-sm font-medium leading-none truncate">{profile.full_name}</p>
              {isPremium && (
                <Badge variant="secondary" className="text-xs bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200 w-fit">
                  <Crown className="w-3 h-3 mr-1" />
                  {profile.subscription_tier}
                </Badge>
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground break-words">
              {profile.email}
            </p>
            {!isPremium && (
              <Badge variant="outline" className="text-xs w-fit">
                Free Plan
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer mobile-touch-target px-4 py-3" asChild>
          <Link to="/billing">
            <Settings className="mr-3 h-4 w-4" />
            <span className="text-sm">Billing & Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600 mobile-touch-target px-4 py-3"
          onClick={signOut}
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="text-sm">Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;