# Launch Plan — Commodity Hub (Google Play, ASAP)

You're close. Branding, security, billing model, and Android assets are in place. What remains is **production hardening + store submission**. Below is the exact order of operations with what I (Lovable) will do vs what you must do locally.

---

## Phase 1 — Switch the app to production mode (Lovable does)

Currently `capacitor.config.ts` is in **dev/live-reload mode** — it loads the Lovable preview URL at runtime. That cannot ship to the Play Store.

1. **Flip `capacitor.config.ts` to production**
   - Remove the `server: { url, cleartext }` block
   - `allowMixedContent: false`
   - `webContentsDebuggingEnabled: false`
2. **Fix PWA manifest brand drift** — `public/manifest.json` still has the old purple `#8B5CF6` for `background_color` and `theme_color`. Update both to brand navy `#1e3a5f` so the PWA, splash, and status bar match.
3. **Fix manifest description** — it still references the removed freemium model ("Track 17 headline commodities free, unlock 60+ specialty markets with Premium"). Replace with paid-app copy from `playStoreCompliance.ts`.
4. **Verify health-check edge function** is deployed and returns 200 (used for uptime monitoring).
5. **Run Supabase security linter** and fix any `error`-level findings (especially RLS).
6. **Confirm production secrets** exist in Supabase Edge Functions: `FMP_API_KEY`, `OILPRICEAPI_KEY`, `MARKETAUX_API_KEY`, etc.

---

## Phase 2 — You build the signed Android release (local)

Cannot be done from Lovable — requires Android Studio + your keystore.

```bash
git pull
npm install
npm run build
npx cap sync android
```

Then in **Android Studio**:
1. **Build → Clean Project → Rebuild Project**
2. **Build → Generate Signed Bundle / AAB**
   - Use the keystore from `mem://launch/android-signing`
   - Output: `android/app/release/app-release.aab`
3. Test the AAB on a physical device via `bundletool` or an internal-test track upload before promoting to production.

**Critical:** uninstall any previously sideloaded debug APK first — the `applicationId` and signing key must match what Play Console expects.

---

## Phase 3 — Google Play Console submission (you do, in browser)

Everything needed for the listing is already generated in `src/utils/playStoreCompliance.ts` and `src/components/app-store/`.

### 3a. App setup
- Create app in Play Console → **Paid app**, price €4.99 / $4.99
- Category: **Finance**
- Target audience: **18+** (per `mem://launch/play-store-listing`)
- Content rating questionnaire: complete (Teen-rated content, no UGC, no ads)

### 3b. Store listing
- **Title:** Commodity Hub - Live Prices & Insights
- **Short description + full description:** copy from `generatePlayStoreMetadata()` in `playStoreCompliance.ts`
- **Icon (512×512):** `public/icons/icon-512-playstore.png`
- **Feature graphic (1024×500):** see `mem://launch/store-assets`
- **Screenshots:** 4–8 phone screenshots (1080×1920+). Use `/screenshots` route or take from a real build.
- **Privacy policy URL:** `https://commodity-hub.lovable.app/privacy-policy`

### 3c. Data Safety form
Fill exactly per `PRIVACY_SETTINGS` in `playStoreCompliance.ts`:
- Collects: email, user ID, purchase history, app interactions, device ID
- No ads / no advertising ID / no location
- Encrypted in transit + at rest
- Account deletion URL: `https://commodity-hub.lovable.app/delete-account`

### 3d. App content
- Financial-services declaration (read-only market data, no trading, no advice)
- News-publisher declaration if you keep aggregated news
- Government-app: No

### 3e. Release
1. Upload signed AAB to **Internal testing** track first
2. Add 2–5 testers, smoke-test for 24h
3. Promote to **Production** when stable

---

## Phase 4 — Web publish + custom domain (optional, parallel)

1. Click **Publish** in Lovable → goes live at `commodity-hub.lovable.app`
2. (Optional) Connect custom domain in Project Settings → Domains

---

## Pre-flight checklist (must all be ✅ before AAB upload)

| Item | Status | Owner |
|------|--------|-------|
| Capacitor `server` block removed | ❌ TODO | Lovable |
| `allowMixedContent` & `webContentsDebuggingEnabled` = false | ❌ TODO | Lovable |
| `manifest.json` colors/description fixed | ❌ TODO | Lovable |
| Supabase RLS linter clean | ❓ Verify | Lovable |
| Health-check endpoint live | ❓ Verify | Lovable |
| Launcher icons (brand) | ✅ Done | — |
| Splash screens (brand) | ✅ Done | — |
| Package ID matches Lovable project | ✅ Done | — |
| `applicationId` / `versionCode` set | ✅ Done | — |
| Keystore secured + backed up | You | You |
| Signed AAB built | — | You |
| Privacy Policy + Terms reachable | ✅ Done | — |
| Account deletion flow works | ✅ Done | — |
| Play Console account ($25) | — | You |
| Store assets uploaded | — | You |
| Data Safety form submitted | — | You |

---

## What I will do if you approve this plan

In a single build pass:
1. Edit `capacitor.config.ts` → production mode
2. Edit `public/manifest.json` → brand colors + paid-app description
3. Run Supabase linter and fix any RLS errors found
4. Verify `health-check` edge function deploys and responds
5. Update `PRODUCTION_SETUP.md` Launch Day Checklist with the final state

Then I'll hand off to you for **Phase 2 (build AAB)** and **Phase 3 (Play submission)** — those steps require your local machine and Google Play Console access.

---

## Realistic timeline

- **Phase 1 (Lovable):** 30 min
- **Phase 2 (you, local build):** 1–2 hours
- **Phase 3 (Play submission):** 2–4 hours of form-filling + asset upload
- **Google review:** typically 1–7 days for first submission

**Fastest path to "live in store":** ~3–7 days from approving this plan.