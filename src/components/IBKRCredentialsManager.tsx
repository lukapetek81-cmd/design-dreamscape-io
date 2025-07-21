import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Save, Eye, EyeOff, Settings } from 'lucide-react';
import { useIBKRCredentials, IBKRCredentials } from '@/hooks/useIBKRCredentials';
import { useIBKR } from '@/contexts/IBKRContext';

interface IBKRCredentialsManagerProps {
  onCredentialsSaved?: () => void;
}

export const IBKRCredentialsManager: React.FC<IBKRCredentialsManagerProps> = ({ 
  onCredentialsSaved 
}) => {
  const { isPremium, connect, connected, isConnecting } = useIBKR();
  const { 
    loading, 
    storedCredentials, 
    saveCredentials, 
    getDecryptedCredentials,
    deleteCredentials 
  } = useIBKRCredentials();

  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<IBKRCredentials>({
    username: '',
    password: '',
    gateway: 'paper'
  });

  if (!isPremium) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            IBKR Credentials
          </CardTitle>
          <CardDescription>
            Premium subscription required for IBKR live data integration
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleSave = async () => {
    if (!formData.username || !formData.password) {
      return;
    }

    const success = await saveCredentials(formData);
    if (success) {
      setIsEditing(false);
      setFormData({ username: '', password: '', gateway: 'paper' });
      onCredentialsSaved?.();
    }
  };

  const handleEdit = () => {
    if (storedCredentials) {
      setFormData({
        username: storedCredentials.username,
        password: '', // Don't pre-fill password for security
        gateway: storedCredentials.gateway
      });
    }
    setIsEditing(true);
  };

  const handleConnect = async () => {
    const credentials = await getDecryptedCredentials();
    if (credentials) {
      await connect(credentials);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete your IBKR credentials?')) {
      await deleteCredentials();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          IBKR Credentials
          {connected && <Badge variant="default" className="bg-green-500">Connected</Badge>}
        </CardTitle>
        <CardDescription>
          Securely store your Interactive Brokers credentials for automatic connection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {storedCredentials && !isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <div className="text-sm text-muted-foreground">{storedCredentials.username}</div>
            </div>
            <div className="space-y-2">
              <Label>Gateway</Label>
              <div className="text-sm text-muted-foreground capitalize">{storedCredentials.gateway}</div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting || connected}
                className="flex-1"
              >
                {isConnecting ? 'Connecting...' : connected ? 'Connected' : 'Connect'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleEdit}
                disabled={loading}
              >
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="IBKR Username"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="IBKR Password"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gateway">Gateway</Label>
              <Select
                value={formData.gateway}
                onValueChange={(value) => setFormData(prev => ({ ...prev, gateway: value }))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gateway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paper">Paper Trading</SelectItem>
                  <SelectItem value="live">Live Trading</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                disabled={loading || !formData.username || !formData.password}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Credentials'}
              </Button>
              {isEditing && (
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};