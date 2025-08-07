import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IBKRCredentials {
  id: string;
  username_encrypted: string;
  password_encrypted: string;
  gateway: string;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useIBKRCredentials = () => {
  const { user, isPremium } = useAuth();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<IBKRCredentials | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && isPremium) {
      loadCredentials();
    }
  }, [user, isPremium]);

  const loadCredentials = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('ibkr_credentials')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      setCredentials(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load IBKR credentials';
      setError(errorMessage);
      console.error('Error loading IBKR credentials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const decryptCredentials = async (credentialId: string): Promise<{ username: string; password: string } | null> => {
    if (!user || !credentials) return null;

    try {
      // Generate user-specific secret (same as used in encryption)
      const userSecret = user.id + user.email;

      // Call the decryption edge function
      const { data, error } = await supabase.functions.invoke('decrypt-api-key', {
        body: {
          encryptedKey: credentials.username_encrypted,
          userSecret: userSecret
        }
      });

      if (error) throw error;

      const usernameResult = data;

      const { data: passwordData, error: passwordError } = await supabase.functions.invoke('decrypt-api-key', {
        body: {
          encryptedKey: credentials.password_encrypted,
          userSecret: userSecret
        }
      });

      if (passwordError) throw passwordError;

      return {
        username: usernameResult.key,
        password: passwordData.key
      };
    } catch (err) {
      console.error('Error decrypting credentials:', err);
      toast({
        title: "Decryption Error",
        description: "Failed to decrypt IBKR credentials",
        variant: "destructive"
      });
      return null;
    }
  };

  const hasActiveCredentials = () => {
    return credentials && credentials.is_active;
  };

  const getGateway = () => {
    return credentials?.gateway || 'paper';
  };

  return {
    credentials,
    isLoading,
    error,
    hasActiveCredentials,
    getGateway,
    decryptCredentials,
    refreshCredentials: loadCredentials
  };
};