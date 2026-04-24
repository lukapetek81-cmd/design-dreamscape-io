import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Shield, Eye, EyeOff, Trash2, Save, Wifi } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { encryptCredential } from '@/lib/encryption';
import { useToast } from '@/hooks/use-toast';
import { useBloFinTrading } from '@/hooks/useBloFinTrading';

interface BloFinFormState {
  apiKey: string;
  secretKey: string;
  passphrase: string;
  environment: 'live' | 'demo';
  isActive: boolean;
}

export const BloFinCredentialsForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { testConnection, isLoading: isTesting } = useBloFinTrading();

  const [form, setForm] = useState<BloFinFormState>({
    apiKey: '',
    secretKey: '',
    passphrase: '',
    environment: 'demo',
    isActive: true,
  });
  const [existingId, setExistingId] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadCredentials = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('blofin_credentials')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingId(data.id);
        setForm(prev => ({
          ...prev,
          environment: data.environment as 'live' | 'demo',
          isActive: data.is_active,
          apiKey: '***masked***',
          secretKey: '***masked***',
          passphrase: '***masked***',
        }));
      }
    } catch (err) {
      console.error('Error loading BloFin credentials:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCredentials();
  }, [loadCredentials]);

  const saveCredentials = async () => {
    if (!user) return;

    if (!form.apiKey || !form.secretKey || !form.passphrase ||
        form.apiKey === '***masked***') {
      toast({
        title: 'Validation Error',
        description: 'All credential fields are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      const userSecret = user.id + user.email;

      const encryptedApiKey = await encryptCredential(form.apiKey, userSecret);
      const encryptedSecretKey = await encryptCredential(form.secretKey, userSecret);
      const encryptedPassphrase = await encryptCredential(form.passphrase, userSecret);

      const credentialData = {
        user_id: user.id,
        api_key_encrypted: encryptedApiKey,
        secret_key_encrypted: encryptedSecretKey,
        passphrase_encrypted: encryptedPassphrase,
        environment: form.environment,
        is_active: form.isActive,
      };

      let result;
      if (existingId) {
        result = await supabase
          .from('blofin_credentials')
          .update(credentialData)
          .eq('id', existingId);
      } else {
        result = await supabase
          .from('blofin_credentials')
          .insert(credentialData);
      }

      if (result.error) throw result.error;

      toast({ title: 'Success', description: 'BloFin credentials saved securely' });
      setForm(prev => ({ ...prev, apiKey: '', secretKey: '', passphrase: '' }));
      await loadCredentials();
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast({
        title: 'Error',
        description: 'Failed to save BloFin credentials',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCredentials = async () => {
    if (!existingId) return;
    try {
      const { error } = await supabase
        .from('blofin_credentials')
        .delete()
        .eq('id', existingId);

      if (error) throw error;
      toast({ title: 'Deleted', description: 'BloFin credentials removed' });
      setExistingId(null);
      setForm({ apiKey: '', secretKey: '', passphrase: '', environment: 'demo', isActive: true });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete credentials', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          BloFin API Connection
        </CardTitle>
        <CardDescription>
          Connect your BloFin account for crypto futures trading. Get API keys from{' '}
          <a href="https://blofin.com/en/apis" target="_blank" rel="noopener noreferrer" className="text-primary underline">
            blofin.com/apis
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Credentials are encrypted with AES-256-GCM before storage. Only you can decrypt them.
          </AlertDescription>
        </Alert>

        {existingId && (
          <Alert>
            <AlertDescription>
              Credentials saved for <strong>{form.environment}</strong> environment
              {form.isActive ? ' (Active)' : ' (Inactive)'}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="blofin-api-key">API Key</Label>
            <Input
              id="blofin-api-key"
              type={showSecrets ? 'text' : 'password'}
              value={form.apiKey}
              onChange={(e) => setForm(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Your BloFin API key"
            />
          </div>

          <div>
            <Label htmlFor="blofin-secret">Secret Key</Label>
            <div className="relative">
              <Input
                id="blofin-secret"
                type={showSecrets ? 'text' : 'password'}
                value={form.secretKey}
                onChange={(e) => setForm(prev => ({ ...prev, secretKey: e.target.value }))}
                placeholder="Your BloFin secret key"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowSecrets(!showSecrets)}
              >
                {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="blofin-passphrase">Passphrase</Label>
            <Input
              id="blofin-passphrase"
              type={showSecrets ? 'text' : 'password'}
              value={form.passphrase}
              onChange={(e) => setForm(prev => ({ ...prev, passphrase: e.target.value }))}
              placeholder="Your BloFin API passphrase"
            />
          </div>

          <div>
            <Label htmlFor="blofin-env">Environment</Label>
            <select
              id="blofin-env"
              value={form.environment}
              onChange={(e) => setForm(prev => ({ ...prev, environment: e.target.value as 'live' | 'demo' }))}
              className="w-full p-2 border border-input rounded-md bg-background"
            >
              <option value="demo">Demo Trading</option>
              <option value="live">Live Trading</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="blofin-active"
              checked={form.isActive}
              onCheckedChange={(checked) => setForm(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="blofin-active">Active connection</Label>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={saveCredentials} disabled={isSaving || isLoading}>
            <Save className="w-4 h-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save Credentials'}
          </Button>

          {existingId && (
            <>
              <Button variant="outline" onClick={testConnection} disabled={isTesting}>
                <Wifi className="w-4 h-4 mr-1" />
                {isTesting ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button variant="destructive" onClick={deleteCredentials}>
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
