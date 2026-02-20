

## Configure RevenueCat API Key

Since the RevenueCat public SDK key (like `goog_...` or test store key) is a **public client-side key** (similar to Supabase's anon key), it's safe to store directly in the `.env` file alongside other public keys.

### Steps

1. **Add the API key to `.env`** -- Add `VITE_REVENUECAT_API_KEY` with your RevenueCat public/test store key to the `.env` file. The existing code in `playBillingService.ts` already reads from `import.meta.env.VITE_REVENUECAT_API_KEY`, so no code changes are needed.

2. **Clean up the placeholder comment** -- Remove the "placeholder" warning comments in `playBillingService.ts` since the key will now be configured.

### What you'll need

When I implement this, I'll ask you to paste your RevenueCat API key (the public SDK key or test store key you got from the RevenueCat dashboard).

