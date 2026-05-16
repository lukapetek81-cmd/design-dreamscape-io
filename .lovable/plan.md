## Google Play Console — Launch Plan

The app code, RevenueCat IAP wiring, RLS hardening, and webhook are ready. What's left is mostly Play Console configuration, store assets, and the signed release build. Below is the end-to-end checklist grouped by what *you* do in dashboards vs. what *I* do in the codebase.

---

### 1. Build the signed release AAB (you, locally)

Prereqs: Android Studio + JDK 17, project pulled from GitHub, `npm install`, `npx cap sync android`.

1. Create an upload keystore (one-time):
   ```
   keytool -genkey -v -keystore ~/keystores/commodity-hub-upload.jks \
     -alias upload -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Add to `~/.gradle/gradle.properties` (NOT in repo):
   ```
   RELEASE_STORE_FILE=/Users/you/keystores/commodity-hub-upload.jks
   RELEASE_STORE_PASSWORD=...
   RELEASE_KEY_ALIAS=upload
   RELEASE_KEY_PASSWORD=...
   ```
3. `npm run build && npx cap sync android`
4. In Android Studio → Build → Generate Signed App Bundle → release → produces `app-release.aab`.

`android/app/build.gradle` already has `versionCode 3 / versionName "1.0.2"` and a `signingConfigs.release` block — no code change needed unless you want to bump the version.

---

### 2. Play Console — App setup tasks

In Play Console → your app → **Dashboard "Set up your app"**:

- **App access** — provide a test login (or "All functionality available without restrictions" if guest browsing is enabled; we currently require auth, so give them a test account).
- **Ads** — "No, my app does not contain ads".
- **Content rating** — fill the IARC questionnaire; financial info app, no UGC, no gambling → expect "Everyone" or PEGI 3.
- **Target audience** — 18+ (matches memory: financial app).
- **News app** — No.
- **COVID-19 contact tracing** — No.
- **Data safety** — declare:
  - Collected: email, user ID (account), app interactions (analytics), crash logs.
  - Encrypted in transit: Yes. User can request deletion: Yes (we have `/delete-account`).
- **Government apps** — No.
- **Financial features** — declare "Personal finance management" (we're a market data + portfolio tracker, *not* a broker; do not tick brokerage).
- **Health declarations** — N/A.
- **Advertising ID** — Not used (uncheck unless you add ads SDK).

### 3. Store listing

- App name: `Commodity Hub` (≤30 chars)
- Short description (≤80 chars)
- Full description (≤4000 chars) — highlight: live energy + 46-commodity catalog, portfolio, news, economic calendar, premium tier.
- Category: **Finance**
- Contact: email + website + privacy policy URL (`/privacy-policy` route already exists — publish a public URL).
- **Graphics required**:
  - App icon 512×512 (PNG, 32-bit)
  - Feature graphic 1024×500
  - Phone screenshots ×4–8 (min 1080px on shorter side)
  - 7" + 10" tablet screenshots (optional but recommended)
- I can regenerate icon/feature graphic from `public/icon.png` if you want — say the word.

### 4. Monetization — In-app products

In Play Console → **Monetize → Products → Subscriptions**:

1. Create a subscription product with the **exact** product ID configured in RevenueCat (check RevenueCat dashboard → Offerings → Packages). Common pattern: `premium_monthly`, `premium_yearly`.
2. Add base plans (monthly/yearly), prices per country, free trial / intro pricing if desired.
3. Mark as **Active**.
4. In RevenueCat → Project Settings → link the Google Play service account JSON (one-time) so RC can read entitlements.
5. RevenueCat dashboard → Integrations → Webhooks → add:
   - URL: `https://kcxhsmlqqyarhlmcapmj.supabase.co/functions/v1/revenuecat-webhook`
   - Authorization header: `Bearer <REVENUECAT_WEBHOOK_AUTH>` (the secret already set in Supabase).

### 5. Internal testing track (recommended first release)

1. Play Console → **Testing → Internal testing → Create new release**.
2. Upload the signed `app-release.aab`.
3. Add testers list (your Google accounts) and opt-in URL.
4. Roll out → wait ~10 min → install via the opt-in link on a real device.
5. Smoke-test: sign-in (Google + email), live prices, portfolio CRUD, premium paywall → purchase with a Play **license tester** account (no real charge), verify `profiles.subscription_active` flips to true via the RC webhook, restore purchases, manage-subscription deep link, account deletion.

### 6. Promote to Closed → Open → Production

- After internal passes, promote the same AAB to **Closed testing** (20+ testers, required by Google before production for new personal-developer accounts) — run for **14 days** minimum.
- Then **Open testing** (optional) or directly **Production** with a staged rollout (start at 10–20%).

### 7. Pre-launch report & policy review

- Play auto-runs a pre-launch report on virtual devices — review crashes/ANRs.
- Submit for review; first-time review can take 3–7 days.

---

### Optional code touch-ups I can do for you

- Bump `versionCode → 4 / versionName → 1.0.3` if we cut a fresh build.
- Add a `PRODUCTION_SETUP.md` section pinning the Play Console / RevenueCat product IDs.
- Generate a 1024×500 feature graphic + 512 icon export under `assets/play-store/`.
- Write release notes (≤500 chars) for the first internal release.

### What I need from you to move forward

1. Confirm subscription product IDs you set up in Play Console (so RevenueCat offerings match).
2. Confirm app name, short description, full description text — or let me draft them.
3. Decide whether you want me to generate the Play Store graphics now.
4. Confirm version bump or keep `1.0.2 / versionCode 3` for the first internal upload.

Reply with answers (or just "draft everything") and I'll prep the code-side deliverables.
