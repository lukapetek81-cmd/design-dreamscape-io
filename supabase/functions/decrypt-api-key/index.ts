import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Secure decryption using AES-GCM (matching the frontend encryption)
class SecureCredentialDecryptor {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;

  // Derive a key from a password (user session-based)
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Decrypt credentials using user-specific key
  static async decryptCredential(encryptedText: string, userSecret: string): Promise<string> {
    try {
      // Decode from base64
      const encryptedData = new Uint8Array(
        atob(encryptedText).split('').map(char => char.charCodeAt(0))
      );

      // Extract salt, iv, and encrypted data
      const salt = encryptedData.slice(0, 16);
      const iv = encryptedData.slice(16, 16 + this.IV_LENGTH);
      const data = encryptedData.slice(16 + this.IV_LENGTH);

      // Derive key from user secret
      const key = await this.deriveKey(userSecret, salt);

      // Decrypt the data
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv,
        },
        key,
        data
      );

      // Convert back to string
      const decoder = new TextDecoder();
      return decoder.decode(decryptedData);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt credential');
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { encryptedKey, userSecret } = await req.json();
    
    if (!encryptedKey || !userSecret) {
      return new Response(
        JSON.stringify({ error: 'Missing encrypted key or user secret' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the master decryption key from environment (Supabase secret)
    const masterSecret = Deno.env.get('CREDENTIAL_MASTER_KEY');
    if (!masterSecret) {
      throw new Error('Master decryption key not configured');
    }

    // Combine user secret with master secret for additional security
    const combinedSecret = `${userSecret}-${masterSecret}`;
    
    const decryptedKey = await SecureCredentialDecryptor.decryptCredential(encryptedKey, combinedSecret);
    
    return new Response(
      JSON.stringify({ key: decryptedKey }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error decrypting API key:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to decrypt credentials' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})