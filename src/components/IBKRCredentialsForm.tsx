import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Shield, Eye, EyeOff, Trash2, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { encryptCredential } from '@/lib/encryption';
import { useToast } from '@/hooks/use-toast';

interface IBKRCredentials {
  id?: string;
  username: string;
  password: string;
  gateway: string;
  is_active: boolean;
}

export const IBKRCredentialsForm: React.FC = () => {
  const { user, isPremium } = useAuth();
  const { toast } = useToast();
  const [credentials, setCredentials] = React.useState<IBKRCredentials>({
    username: '',
    password: '',
    gateway: 'paper', // Default to paper trading
    is_active: true
  });
  const [existingCredentials, setExistingCredentials] = React.useState<IBKRCredentials | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Load existing credentials
  React.useEffect(() => {
    if (user && isPremium) {
      loadCredentials();
    }
  }, [user, isPremium]);

  const loadCredentials = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ibkr_credentials')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingCredentials({
          id: data.id,
          username: '***masked***',
          password: '***masked***',
          gateway: data.gateway,
          is_active: data.is_active
        });
        setCredentials(prev => ({
          ...prev,
          gateway: data.gateway,
          is_active: data.is_active
        }));
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
      toast({
        title: "Error",
        description: "Failed to load IBKR credentials",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveCredentials = async () => {
    if (!user || !isPremium) return;
    
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Validation Error",
        description: "Username and password are required",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      
      // Generate user-specific secret from session
      const userSecret = user.id + user.email;
      
      // Encrypt credentials
      const encryptedUsername = await encryptCredential(credentials.username, userSecret);
      const encryptedPassword = await encryptCredential(credentials.password, userSecret);

      const credentialData = {
        user_id: user.id,
        username_encrypted: encryptedUsername,
        password_encrypted: encryptedPassword,
        gateway: credentials.gateway,
        is_active: credentials.is_active
      };

      let result;
      if (existingCredentials?.id) {
        // Update existing
        result = await supabase
          .from('ibkr_credentials')
          .update(credentialData)
          .eq('id', existingCredentials.id);
      } else {
        // Insert new
        result = await supabase
          .from('ibkr_credentials')
          .insert(credentialData);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: "IBKR credentials saved securely",
      });

      // Clear form and reload
      setCredentials(prev => ({
        ...prev,
        username: '',
        password: ''
      }));
      await loadCredentials();

    } catch (error) {
      console.error('Error saving credentials:', error);
      toast({
        title: "Error",
        description: "Failed to save IBKR credentials",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCredentials = async () => {
    if (!existingCredentials?.id) return;

    try {
      const { error } = await supabase
        .from('ibkr_credentials')
        .delete()
        .eq('id', existingCredentials.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "IBKR credentials deleted",
      });

      setExistingCredentials(null);
      setCredentials({
        username: '',
        password: '',
        gateway: 'paper',
        is_active: true
      });

    } catch (error) {
      console.error('Error deleting credentials:', error);
      toast({
        title: "Error",
        description: "Failed to delete IBKR credentials",
        variant: "destructive"
      });
    }
  };

  if (!isPremium) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            IBKR Integration
          </CardTitle>
          <CardDescription>
            Connect your Interactive Brokers account for live trading data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Premium subscription required to connect IBKR account
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          IBKR Credentials
        </CardTitle>
        <CardDescription>
          Securely store your Interactive Brokers credentials using AES-256 encryption
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Your credentials are encrypted with AES-256-GCM and stored securely. They cannot be accessed by third parties.
          </AlertDescription>
        </Alert>

        {existingCredentials && (
          <Alert>
            <AlertDescription>
              Credentials are currently saved for gateway: <strong>{existingCredentials.gateway}</strong>
              {existingCredentials.is_active ? ' (Active)' : ' (Inactive)'}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Your IBKR username"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Your IBKR password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="gateway">Gateway</Label>
            <select
              id="gateway"
              value={credentials.gateway}
              onChange={(e) => setCredentials(prev => ({ ...prev, gateway: e.target.value }))}
              className="w-full p-2 border border-input rounded-md bg-background"
            >
              <option value="paper">Paper Trading</option>
              <option value="live">Live Trading</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={credentials.is_active}
              onCheckedChange={(checked) => setCredentials(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Active connection</Label>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={saveCredentials} 
            disabled={isSaving || isLoading}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Credentials'}
          </Button>
          
          {existingCredentials && (
            <Button 
              variant="destructive" 
              onClick={deleteCredentials}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};