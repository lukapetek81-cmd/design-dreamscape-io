import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple decryption function (this should match the encryption logic in your frontend)
const decrypt = (encryptedKey: string): string => {
  try {
    // For now, we'll just return the key as-is since it might be stored as plain text
    // In a real implementation, you'd decrypt it here
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