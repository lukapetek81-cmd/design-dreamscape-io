# Fix AI Copilot

## Root cause

The edge function `supabase/functions/ai-copilot/index.ts` calls:

```ts
messages: convertToModelMessages(messages as UIMessage[])
```

In AI SDK v6, `convertToModelMessages` returns a **Promise**, not an array. `streamText` then runs `messages.some(...)` on a Promise and throws `TypeError: messages.some is not a function`. Every Copilot request returns 500, which surfaces as a global toast and broken-feeling app.

The rest of the app (Dashboard, oil prices, etc.) is actually loading correctly per the console + dev-server logs — but the failed streaming request and unhandled error make it feel broken.

## Fix

1. **Edge function — `supabase/functions/ai-copilot/index.ts`**
   - `await convertToModelMessages(messages as UIMessage[])` before passing to `streamText`.
   - Wrap the inner request handling in try/catch and always return JSON with CORS headers (already mostly there, just make sure the streaming branch can't throw synchronously).
   - Keep the existing 401 / 404 / 429 / 402 handling.

2. **Frontend — `src/pages/Copilot.tsx`**
   - The `useChat` `onError` already shows a toast; add a visible inline error banner inside `ChatWindow` and ensure the textarea re-enables after a failed send (status returns to `ready`, so this should already work — just verify after the fix).
   - No global error boundary changes needed; the rest of the app is unaffected.

3. **Verify after deploy**
   - Redeploy `ai-copilot` and `curl_edge_functions` POST a minimal `{ messages: [{role:"user", parts:[{type:"text", text:"hi"}]}], threadId: "<uuid>" }` with the preview-session auth to confirm a streamed 200 response.
   - Open `/copilot` in the preview, send "hi", confirm a streamed reply and that Dashboard + other pages remain functional.

## Out of scope

- No DB schema changes.
- No new features from the Tier 1/2/3 roadmap — just the bug fix.
- No UI redesign of the Copilot page.
