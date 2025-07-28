import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { encrypt, decrypt } from '@/lib/encryption';
import { supabase } from '@/integrations/supabase/client';

interface CommodityPriceAPICredentials {
  apiKey: string;
}

export const useCommodityPriceAPICredentials = () => {
  const { user } = useAuth();
  const [storedCredentials, setStoredCredentials] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if credentials exist
  const checkStoredCredentials = useCallback(async () => {
    if (!user) {
      setStoredCredentials(false);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('commodity_price_api_credentials')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking credentials:', error);
        setStoredCredentials(false);
      } else {
        setStoredCredentials(!!data?.commodity_price_api_credentials);
      }
    } catch (error) {
      console.error('Error checking stored credentials:', error);
      setStoredCredentials(false);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Save credentials
  const saveCredentials = useCallback(async (credentials: CommodityPriceAPICredentials) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const encryptedCredentials = encrypt(JSON.stringify(credentials));
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          commodity_price_api_credentials: encryptedCredentials
        });

      if (error) throw error;
      
      setStoredCredentials(true);
    } catch (error) {
      console.error('Error saving credentials:', error);
      throw error;
    }
  }, [user]);

  // Get decrypted credentials
  const getDecryptedCredentials = useCallback(async (): Promise<CommodityPriceAPICredentials | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('commodity_price_api_credentials')
        .eq('user_id', user.id)
        .single();

      if (error || !data?.commodity_price_api_credentials) return null;

      const decryptedData = decrypt(data.commodity_price_api_credentials);
      return JSON.parse(decryptedData) as CommodityPriceAPICredentials;
    } catch (error) {
      console.error('Error decrypting credentials:', error);
      return null;
    }
  }, [user]);

  // Clear credentials
  const clearCredentials = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ commodity_price_api_credentials: null })
        .eq('user_id', user.id);

      if (error) throw error;
      
      setStoredCredentials(false);
    } catch (error) {
      console.error('Error clearing credentials:', error);
      throw error;
    }
  }, [user]);

  useEffect(() => {
    checkStoredCredentials();
  }, [checkStoredCredentials]);

  return {
    storedCredentials,
    isLoading,
    saveCredentials,
    getDecryptedCredentials,
    clearCredentials
  };
};