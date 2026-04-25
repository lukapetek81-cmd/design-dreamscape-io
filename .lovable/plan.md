## Goal

Make the installed Android APK load your live Lovable preview so you can test functionality on your phone without rebuilding the APK on every change.

## Why you're seeing the placeholder

`capacitor.config.ts` currently has the `server` block commented out. With no bundled `dist/` and no remote URL, the WebView falls back to the Lovable preview host, which shows the "publish or update your Lovable project" message because the app isn't published.

## Changes

### 1. `capacitor.config.ts` — enable live reload

Uncomment and update the `server` block to point at the published preview URL:

```ts
server: {
  url: 'https://id-preview--0cea242b-6aba-4f5a-9e49-91997ef3b761.lovable.app?forceHideBadge=true',
  cleartext: true,
},
```

Also flip `allowMixedContent: true` and `webContentsDebuggingEnabled: true` for development (we'll revert before Play Store submission).

### 2. Add a clear README note

Document the two modes (dev live-reload vs. production bundled) at the top of `PRODUCTION_SETUP.md` so it's obvious what to switch before publishing:

- **Dev mode**: `server.url` enabled → live reload from Lovable
- **Production mode**: `server` block removed → uses bundled `dist/`, run `npm run build && npx cap sync android` before each release build

### 3. Action you take locally

After I make the change:
1. `git pull`
2. `npx cap sync android`
3. Rebuild the APK in Android Studio and install on your phone

From then on, every code change in Lovable appears instantly on the phone — no further rebuilds needed until you go to production.

## Out of scope

- OAuth deep-link won't fully work in live-reload mode (loads from Lovable host, not `https://localhost`). For OAuth testing, use the production bundle path.
- Production build instructions (already in `PRODUCTION_SETUP.md`).

## Pre-Play-Store revert checklist

Before generating the signed AAB:
- Comment out the `server` block again
- Set `allowMixedContent: false` and `webContentsDebuggingEnabled: false`
- Run `npm run build && npx cap sync android`
- Build signed release in Android Studio
