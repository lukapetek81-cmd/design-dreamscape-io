import React, { ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createNativeImplicitOAuthClient, supabase, purgeMalformedSupabaseTokens } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateFormData } from '@/utils/validation';
import { authRateLimiter } from '@/utils/security';
import { Capacitor } from '@capacitor/core';
import { NATIVE_OAUTH_WEB_BRIDGE_URL } from '@/utils/nativeOAuth';
import { tierFromProfile, type Tier } from '@/utils/tiers';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: string;
  subscription_active: boolean;
  subscription_end: string | null;
  billing_state: string | null;
  grace_period_expires_at: string | null;
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
  isPro: boolean;
  tier: Tier;
  billingState: Profile['billing_state'];
  gracePeriodExpiresAt: string | null;
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
        // PGRST116 = no rows. For OAuth users whose profile wasn't auto-
        // created (or the trigger failed), upsert one from auth metadata so
        // the UI doesn't keep treating them as signed out.
        if ((error as any).code === 'PGRST116' || /no rows/i.test(error.message || '')) {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            const fallback = {
              id: authUser.id,
              email: authUser.email ?? '',
              full_name:
                (authUser.user_metadata as any)?.full_name ??
                (authUser.user_metadata as any)?.name ??
                authUser.email ?? null,
              avatar_url:
                (authUser.user_metadata as any)?.avatar_url ??
                (authUser.user_metadata as any)?.picture ?? null,
            };
            const { data: upserted } = await supabase
              .from('profiles')
              .upsert(fallback, { onConflict: 'id' })
              .select('*')
              .single();
            if (upserted) setProfile(upserted);
          }
          return;
        }
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const profileFromUser = React.useCallback((authUser: User): Profile => {
    const meta: any = authUser.user_metadata ?? {};
    const now = new Date().toISOString();

    return {
      id: authUser.id,
      email: authUser.email ?? '',
      full_name: meta.full_name ?? meta.name ?? authUser.email ?? null,
      avatar_url: meta.avatar_url ?? meta.picture ?? null,
      subscription_tier: 'free',
      subscription_active: false,
      subscription_end: null,
      billing_state: null,
      grace_period_expires_at: null,
      created_at: authUser.created_at ?? now,
      updated_at: now,
    };
  }, []);

  const applySession = React.useCallback((nextSession: Session | null) => {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);
    setLoading(false);

    if (nextSession?.user) {
      // Show the signed-in avatar/menu immediately from Google metadata; the
      // database profile can arrive later without blocking the top-right UI.
      setProfile((current) => current?.id === nextSession.user.id ? current : profileFromUser(nextSession.user));
      setTimeout(() => fetchProfile(nextSession.user.id), 0);
    } else {
      setProfile(null);
    }
  }, [profileFromUser]);

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
    // Add timeout to prevent infinite loading on mobile
    const loadingTimeout = setTimeout(() => {
      console.warn('Auth loading timeout - forcing loading to false');
      setLoading(false);
    }, 5000);

    // Native OAuth deep-link handler dispatches this after setSession() so
    // the avatar/menu update without waiting for the Supabase listener tick.
    const handleNativeSession = (e: Event) => {
      const detail = (e as CustomEvent).detail as { session: Session | null } | undefined;
      applySession(detail?.session ?? null);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('auth:native-session', handleNativeSession);
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email || 'no user');
        clearTimeout(loadingTimeout);
        // After explicit sign-out, scrub any malformed tokens left in
        // localStorage so the next reload starts clean. Do NOT purge on
        // TOKEN_REFRESHED — a successful refresh is the happy path and the
        // narrowed purge wouldn't touch a valid session anyway, but running
        // it adds risk of race conditions during OAuth callback handoff.
        if (event === 'SIGNED_OUT') {
          purgeMalformedSupabaseTokens();
        }
        applySession(session);
        
        if (session?.user) {
          // Defer profile fetching and subscription check to avoid blocking auth state changes
          setTimeout(() => {
            // Check subscription status on login (with slight delay)
            setTimeout(() => {
              checkSubscriptionStatus(session.user.id);
            }, 2000);
          }, 0);
        }
      }
    );

    // If we returned from an OAuth provider with a `?code=...` in the URL
    // but the supabase client hasn't (yet) finished the auto-exchange, do
    // it explicitly and then clean the URL so a refresh can't replay it.
    const finalizeOAuthRedirect = async () => {
      if (typeof window === 'undefined') return;
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      if (!code) return;
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) console.warn('OAuth code exchange failed:', error.message);
      } catch (e) {
        console.warn('OAuth code exchange threw:', e);
      } finally {
        url.searchParams.delete('code');
        url.searchParams.delete('state');
        window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
      }
    };

    // Check for existing session with error handling. If the stored token is
    // malformed (e.g. missing `sub` claim from a prior project key rotation),
    // signOut() to flush it from memory + localStorage so the user can sign
    // back in cleanly instead of being stuck in a half-authenticated state.
    const initSession = async () => {
      try {
        await finalizeOAuthRedirect();
        const { data: { session }, error } = await supabase.auth.getSession();
        clearTimeout(loadingTimeout);

        if (error) {
          console.error('Session check error — flushing bad token:', error);
          try { await supabase.auth.signOut({ scope: 'local' } as any); } catch {}
          purgeMalformedSupabaseTokens();
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        console.log('Initial session check:', session?.user?.email || 'no user');
        applySession(session);
      } catch (error) {
        console.error('Failed to get session:', error);
        clearTimeout(loadingTimeout);
        try { await supabase.auth.signOut({ scope: 'local' } as any); } catch {}
        purgeMalformedSupabaseTokens();
        setLoading(false);
      }
    };
    void initSession();

    return () => {
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth:native-session', handleNativeSession);
      }
    };
  }, [applySession, checkSubscriptionStatus]);

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
      const isNative = Capacitor.isNativePlatform();
      const redirectTo = isNative
        ? NATIVE_OAUTH_WEB_BRIDGE_URL
        : `${window.location.origin}/`;

      const oauthClient = isNative ? createNativeImplicitOAuthClient() : supabase;
      const { data, error } = await oauthClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: isNative,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('auth:error', { detail: { message: error.message } })
          );
        }
        toast({
          title: "Google Sign In Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // On native, open Google's consent screen in the system browser. We use
      // the hosted bridge as the Supabase redirect target because it is already
      // a normal HTTPS app URL in Supabase/Google allow-lists. The bridge then
      // forwards the OAuth payload back to the installed app with the
      // commodityhub:// deep link.
      if (isNative && data?.url) {
        try {
          localStorage.setItem('auth:native-oauth-pending', '1');
          const { Browser } = await import('@capacitor/browser');
          await Browser.open({
            url: data.url,
            presentationStyle: 'fullscreen',
            windowName: '_self',
          });
        } catch (browserErr) {
          console.error('Failed to open in-app browser for OAuth:', browserErr);
          return { error: browserErr };
        }
      }

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('auth:error', { detail: { message: errorMessage } })
        );
      }
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
  const baseTier: Tier = tierFromProfile(profile?.subscription_active, profile?.subscription_tier);

  // Dev/preview override: visit any page with ?preview=pro|premium|off to simulate a tier
  // locally (persisted in localStorage as `tier_preview`). Set ?preview=off to clear.
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('preview');
    if (p === 'pro' || p === 'premium') localStorage.setItem('tier_preview', p);
    else if (p === 'off' || p === 'clear') localStorage.removeItem('tier_preview');
  }
  const previewTier =
    typeof window !== 'undefined'
      ? (localStorage.getItem('tier_preview') as Tier | null)
      : null;
  const tier: Tier = previewTier ?? baseTier;
  // isPremium = "any paid tier" (Premium or Pro). isPro = Pro-only features.
  const isPremium = tier !== 'free';
  const isPro = tier === 'pro';
  const billingState = profile?.billing_state ?? 'none';
  const gracePeriodExpiresAt = profile?.grace_period_expires_at ?? null;
  
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
    isPro,
    tier,
    billingState,
    gracePeriodExpiresAt,
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