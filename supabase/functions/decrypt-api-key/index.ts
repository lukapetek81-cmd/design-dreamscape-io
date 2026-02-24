import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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
    // Validate authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      console.error('Master decryption key not configured in environment');
      throw new Error('Master decryption key not configured');
    }

    // Try decryption with combined secret first (new format)
    const combinedSecret = `${userSecret}-${masterSecret}`;
    
    try {
      console.log('Attempting decryption with combined secret');
      const decryptedKey = await SecureCredentialDecryptor.decryptCredential(encryptedKey, combinedSecret);
      console.log('Decryption successful with combined secret');
      return new Response(
        JSON.stringify({ key: decryptedKey }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (combinedError) {
      console.log('Combined secret decryption failed, trying user secret only (legacy format)');
      
      // Fallback: try with just user secret (for legacy credentials)
      try {
        const decryptedKey = await SecureCredentialDecryptor.decryptCredential(encryptedKey, userSecret);
        console.log('Decryption successful with user secret only (legacy)');
        return new Response(
          JSON.stringify({ key: decryptedKey }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (legacyError) {
        console.error('Both decryption methods failed:', { combinedError, legacyError });
        throw new Error('Failed to decrypt credential with both new and legacy methods');
      }
    }

  } catch (error) {
    console.error('Error decrypting API key:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to decrypt credentials' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})