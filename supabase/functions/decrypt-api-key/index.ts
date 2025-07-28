import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple decryption function (this should match the encryption logic in your frontend)
const decrypt = (encryptedKey: string): string => {
  try {
    // Based on the data I saw in the database, it looks like the key might be base64 encoded
    // Let's try to decode it and extract the apiKey
    try {
      const decoded = atob(encryptedKey);
      // If it contains JSON, parse it
      if (decoded.includes('{') && decoded.includes('apiKey')) {
        const parsed = JSON.parse(decoded.split('ibkr-creds-key-2024')[1].split('ibkr-creds-key-2024')[0]);
        return parsed.apiKey;
      }
    } catch (e) {
      // If decoding fails, maybe it's already the plain key
    }
    
    // If all else fails, return as-is (might be already decrypted)
    return encryptedKey;
  } catch (error) {
    throw new Error('Failed to decrypt API key');
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { encryptedKey } = await req.json();
    
    if (!encryptedKey) {
      return new Response(
        JSON.stringify({ error: 'No encrypted key provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const decryptedKey = decrypt(encryptedKey);
    
    return new Response(
      JSON.stringify({ key: decryptedKey }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error decrypting API key:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})