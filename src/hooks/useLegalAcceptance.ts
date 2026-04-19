import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TERMS_VERSION, RISK_DISCLOSURE_VERSION } from '@/lib/legalVersions';

interface AcceptanceRecord {
  terms_version: string;
  risk_disclosure_version: string;
  accepted_at: string;
}

/**
 * Tracks whether the current user has accepted the latest Terms of Service and
 * Risk Disclosure versions. Used by synthetic trading to gate the first trade.
 */
export const useLegalAcceptance = () => {
  const { user } = useAuth();
  const [record, setRecord] = useState<AcceptanceRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAcceptance = useCallback(async () => {
    if (!user) {
      setRecord(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('user_legal_acceptance')
      .select('terms_version, risk_disclosure_version, accepted_at')
      .eq('user_id', user.id)
      .maybeSingle();
    setRecord(data ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAcceptance();
  }, [fetchAcceptance]);

  const isAccepted =
    !!record &&
    record.terms_version === TERMS_VERSION &&
    record.risk_disclosure_version === RISK_DISCLOSURE_VERSION;

  const accept = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    const payload = {
      user_id: user.id,
      terms_version: TERMS_VERSION,
      risk_disclosure_version: RISK_DISCLOSURE_VERSION,
      accepted_at: new Date().toISOString(),
    };
    // Upsert on user_id (unique constraint)
    const { error } = await supabase
      .from('user_legal_acceptance')
      .upsert(payload, { onConflict: 'user_id' });
    if (error) {
      console.error('Failed to record acceptance:', error);
      return false;
    }
    setRecord({
      terms_version: payload.terms_version,
      risk_disclosure_version: payload.risk_disclosure_version,
      accepted_at: payload.accepted_at,
    });
    return true;
  }, [user]);

  return { isAccepted, loading, accept, refresh: fetchAcceptance };
};
