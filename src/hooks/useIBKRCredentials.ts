import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { encryptCredential, decryptCredential } from '@/lib/encryption';
import { useToast } from '@/hooks/use-toast';

export interface IBKRCredentials {
  username: string;
  password: string;
  gateway: string;
}

export interface StoredIBKRCredentials {
  id: string;
  username: string;
  gateway: string;
  isActive: boolean;
}

export const useIBKRCredentials = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [storedCredentials, setStoredCredentials] = useState<StoredIBKRCredentials | null>(null);

  // Load stored credentials
  const loadCredentials = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ibkr_credentials')
        .select('id, username_encrypted, gateway, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error loading IBKR credentials:', error);
        return;
      }

      if (data) {
        setStoredCredentials({
          id: data.id,
          username: decryptCredential(data.username_encrypted),
          gateway: data.gateway,
          isActive: data.is_active,
        });
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save credentials
  const saveCredentials = async (credentials: IBKRCredentials): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save IBKR credentials",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);

      const encryptedData = {
        user_id: user.id,
        username_encrypted: encryptCredential(credentials.username),
        password_encrypted: encryptCredential(credentials.password),
        gateway: credentials.gateway,
        is_active: true,
      };

      // Use upsert to handle existing credentials
      const { error } = await supabase
        .from('ibkr_credentials')
        .upsert(encryptedData, {
          onConflict: 'user_id',
          ignoreDuplicates: false,
        });

      if (error) {
        console.error('Error saving IBKR credentials:', error);
        toast({
          title: "Save failed",
          description: "Failed to save IBKR credentials",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Credentials saved",
        description: "IBKR credentials saved securely",
      });

      // Reload credentials to update UI
      await loadCredentials();
      return true;
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast({
        title: "Save failed",
        description: "Failed to save IBKR credentials",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get decrypted credentials for connection
  const getDecryptedCredentials = async (): Promise<IBKRCredentials | null> => {
    if (!user || !storedCredentials) return null;

    try {
      const { data, error } = await supabase
        .from('ibkr_credentials')
        .select('username_encrypted, password_encrypted, gateway')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.error('Error getting credentials for connection:', error);
        return null;
      }

      return {
        username: decryptCredential(data.username_encrypted),
        password: decryptCredential(data.password_encrypted),
        gateway: data.gateway,
      };
    } catch (error) {
      console.error('Error decrypting credentials:', error);
      return null;
    }
  };

  // Delete credentials
  const deleteCredentials = async (): Promise<boolean> => {
    if (!user || !storedCredentials) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('ibkr_credentials')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting IBKR credentials:', error);
        toast({
          title: "Delete failed",
          description: "Failed to delete IBKR credentials",
          variant: "destructive",
        });
        return false;
      }

      setStoredCredentials(null);
      toast({
        title: "Credentials deleted",
        description: "IBKR credentials removed",
      });
      return true;
    } catch (error) {
      console.error('Error deleting credentials:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadCredentials();
    } else {
      setStoredCredentials(null);
    }
  }, [user]);

  return {
    loading,
    storedCredentials,
    saveCredentials,
    getDecryptedCredentials,
    deleteCredentials,
    reloadCredentials: loadCredentials,
  };
};