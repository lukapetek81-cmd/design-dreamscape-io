import React, { ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateFormData } from '@/utils/validation';
import { authRateLimiter } from '@/utils/security';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: string;
  subscription_active: boolean;
  subscription_end: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isGuest: boolean;
  isPremium: boolean;
  requiresAuth: () => boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType | null => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    // During initial render, return null instead of throwing error
    return null;
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const checkSubscriptionStatus = React.useCallback(async (userId: string) => {
    try {
      // Check subscription status after login
      const session = await supabase.auth.getSession();
      if (session.data.session?.access_token) {
        await supabase.functions.invoke('check-subscription', {
          headers: {
            Authorization: `Bearer ${session.data.session.access_token}`,
          },
        });
        // Refresh profile after checking subscription
        setTimeout(() => {
          fetchProfile(userId);
        }, 1000);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  React.useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching and subscription check to avoid blocking auth state changes
          setTimeout(() => {
            fetchProfile(session.user.id);
            // Check subscription status on login (with slight delay)
            setTimeout(() => {
              checkSubscriptionStatus(session.user.id);
            }, 2000);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkSubscriptionStatus]);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      // Rate limiting check
      const rateCheck = authRateLimiter.check('signup');
      if (!rateCheck.allowed) {
        const error = new Error('Too many signup attempts. Please wait before trying again.');
        toast({
          title: "Rate Limit Exceeded",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Input validation
      const emailValidation = validateFormData.email(email);
      const passwordValidation = validateFormData.password(password);
      const nameValidation = fullName ? validateFormData.name(fullName) : null;

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: emailValidation,
        password: passwordValidation,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: nameValidation || emailValidation.split('@')[0]
          }
        }
      });

      if (error) {
        toast({
          title: "Sign Up Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your signup.",
        });
      }

      return { error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid input provided';
      toast({
        title: "Sign Up Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Rate limiting check
      const rateCheck = authRateLimiter.check('signin');
      if (!rateCheck.allowed) {
        const error = new Error('Too many signin attempts. Please wait before trying again.');
        toast({
          title: "Rate Limit Exceeded",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Input validation
      const emailValidation = validateFormData.email(email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: emailValidation,
        password,
      });

      if (error) {
        toast({
          title: "Sign In Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been successfully signed in.",
        });
      }

      return { error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid input provided';
      toast({
        title: "Sign In Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        toast({
          title: "Google Sign In Error",
          description: error.message,
          variant: "destructive",
        });
      }

      return { error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "Google Sign In Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Sign Out Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "Sign Out Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Rate limiting check
      const rateCheck = authRateLimiter.check('reset');
      if (!rateCheck.allowed) {
        const error = new Error('Too many reset attempts. Please wait before trying again.');
        toast({
          title: "Rate Limit Exceeded",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Input validation
      const emailValidation = validateFormData.email(email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(emailValidation, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Reset Password Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reset email sent",
          description: "Check your email for a password reset link.",
        });
      }

      return { error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid input provided';
      toast({
        title: "Reset Password Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { error };
    }
  };

  const isGuest = !user;
  const isPremium = profile?.subscription_active && profile?.subscription_tier !== 'free';
  
  const requiresAuth = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to access premium features.",
      });
      return true;
    }
    return false;
  };

  const value = {
    user,
    session,
    profile,
    loading,
    isGuest,
    isPremium,
    requiresAuth,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshProfile,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};