import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/utils.ts';

const BLOFIN_API_URL = 'https://openapi.blofin.com';
const BLOFIN_DEMO_API_URL = 'https://demo-trading-openapi.blofin.com';

function hmacSign(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(key =>
    crypto.subtle.sign('HMAC', key, encoder.encode(message))
  ).then(sig =>
    btoa(String.fromCharCode(...new Uint8Array(sig)))
  );
}

async function makeSignedRequest(
  method: string,
  path: string,
  body: string | null,
  apiKey: string,
  secretKey: string,
  passphrase: string,
  isDemo: boolean
) {
  const timestamp = new Date().toISOString();
  const preSign = timestamp + method.toUpperCase() + path + (body || '');
  const signature = await hmacSign(preSign, secretKey);

  const baseUrl = isDemo ? BLOFIN_DEMO_API_URL : BLOFIN_API_URL;
  
  const headers: Record<string, string> = {
    'ACCESS-KEY': apiKey,
    'ACCESS-SIGN': signature,
    'ACCESS-TIMESTAMP': timestamp,
    'ACCESS-PASSPHRASE': passphrase,
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${baseUrl}${path}`, {
    method: method.toUpperCase(),
    headers,
    body: body || undefined,
  });

  return response.json();
}

// Simple AES-GCM decryption matching client-side encryption
async function decryptCredential(encryptedText: string, userSecret: string): Promise<string> {
  const encryptedData = new Uint8Array(
    atob(encryptedText).split('').map(char => char.charCodeAt(0))
  );

  const salt = encryptedData.slice(0, 16);
  const iv = encryptedData.slice(16, 28);
  const data = encryptedData.slice(28);

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userSecret),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  return new TextDecoder().decode(decryptedData);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { action } = body;

    // Get user's BloFin credentials
    const { data: credentials, error: credError } = await supabaseClient
      .from('blofin_credentials')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (credError || !credentials) {
      return new Response(
        JSON.stringify({ error: 'No active BloFin credentials found. Please add your API keys first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decrypt credentials
    const userSecret = user.id + user.email;
    let apiKey: string, secretKey: string, passphrase: string;
    
    try {
      apiKey = await decryptCredential(credentials.api_key_encrypted, userSecret);
      secretKey = await decryptCredential(credentials.secret_key_encrypted, userSecret);
      passphrase = await decryptCredential(credentials.passphrase_encrypted, userSecret);
    } catch (decryptError) {
      console.error('Decryption failed:', decryptError);
      return new Response(
        JSON.stringify({ error: 'Failed to decrypt credentials. Please re-save your API keys.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isDemo = credentials.environment === 'demo';
    let result;

    switch (action) {
      case 'account-balance': {
        result = await makeSignedRequest('GET', '/api/v1/account/balance', null, apiKey, secretKey, passphrase, isDemo);
        break;
      }
      case 'positions': {
        result = await makeSignedRequest('GET', '/api/v1/account/positions', null, apiKey, secretKey, passphrase, isDemo);
        break;
      }
      case 'place-order': {
        const { instId, side, orderType, size, price } = body;
        if (!instId || !side || !orderType || !size) {
          return new Response(
            JSON.stringify({ error: 'Missing required order fields: instId, side, orderType, size' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const orderBody: Record<string, string> = {
          instId,
          marginMode: 'cross',
          side,
          orderType,
          size: String(size),
        };
        if (price) orderBody.price = String(price);
        
        result = await makeSignedRequest('POST', '/api/v1/trade/order', JSON.stringify(orderBody), apiKey, secretKey, passphrase, isDemo);
        break;
      }
      case 'cancel-order': {
        const { orderId, instId: cancelInstId } = body;
        if (!orderId || !cancelInstId) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields: orderId, instId' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = await makeSignedRequest('POST', '/api/v1/trade/cancel-order', JSON.stringify({ orderId, instId: cancelInstId }), apiKey, secretKey, passphrase, isDemo);
        break;
      }
      case 'open-orders': {
        result = await makeSignedRequest('GET', '/api/v1/trade/orders-pending', null, apiKey, secretKey, passphrase, isDemo);
        break;
      }
      case 'order-history': {
        result = await makeSignedRequest('GET', '/api/v1/trade/orders-history', null, apiKey, secretKey, passphrase, isDemo);
        break;
      }
      case 'tickers': {
        // Public endpoint - no auth needed
        const baseUrl = isDemo ? BLOFIN_DEMO_API_URL : BLOFIN_API_URL;
        const tickerResponse = await fetch(`${baseUrl}/api/v1/market/tickers`);
        result = await tickerResponse.json();
        break;
      }
      case 'instruments': {
        const baseUrl = isDemo ? BLOFIN_DEMO_API_URL : BLOFIN_API_URL;
        const instResponse = await fetch(`${baseUrl}/api/v1/market/instruments`);
        result = await instResponse.json();
        break;
      }
      case 'test-connection': {
        result = await makeSignedRequest('GET', '/api/v1/account/balance', null, apiKey, secretKey, passphrase, isDemo);
        if (result.code === '0') {
          result = { success: true, message: 'Connection successful', environment: credentials.environment };
        } else {
          result = { success: false, message: result.msg || 'Connection failed' };
        }
        break;
      }
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('BloFin trading error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
