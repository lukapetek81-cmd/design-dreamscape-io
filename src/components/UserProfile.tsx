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
  const { user, profile, signOut, isGuest } = useAuth();

  if (isGuest) {
    return (
      <div className="flex items-center gap-1.5">
        <Link to="/auth">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 px-2">
            <User className="w-3 h-3" />
            <span className="hidden sm:inline">Sign In</span>
            <span className="sm:hidden">Sign</span>
          </Button>
        </Link>
        <Link to="/auth">
          <Button size="sm" className="gap-1.5 text-xs h-8 px-2">
            <span className="hidden sm:inline">Sign Up Free</span>
            <span className="sm:hidden">Join</span>
          </Button>
        </Link>
      </div>
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 sm:h-8 sm:w-8 rounded-full mobile-touch-target">
          <Avatar className="h-10 w-10 sm:h-8 sm:w-8">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(profile?.full_name || profile?.email || 'User')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 sm:w-56 mr-2 sm:mr-0" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex flex-col space-y-3">
            <p className="text-sm font-medium leading-none truncate">{profile?.full_name}</p>
            <p className="text-xs leading-none text-muted-foreground break-words">
              {profile?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer mobile-touch-target px-4 py-3" asChild>
          <Link to="/billing">
            <Settings className="mr-3 h-4 w-4" />
            <span className="text-sm">Account Settings</span>
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