
The user wants a QA checklist artifact, not code changes. This is a reference deliverable. I'll present it inline as the plan — once approved I'll generate a markdown file in `/mnt/documents/` for download.

## Pre-launch QA checklist — RevenueCat × Play Billing

### 0. Pre-test setup (do once)
- [ ] Signed AAB uploaded to **Internal testing** track in Play Console
- [ ] Tester Google account added to Play Console → **Testing → Internal testing → Testers**
- [ ] Same account added to **Setup → License testing** (gives free test purchases + faster renewals)
- [ ] Tester opted in via Play Store internal test link, then installed the app from Play Store (NOT sideloaded — sideloads cannot complete real Billing flows)
- [ ] RevenueCat dashboard → Products imported, `premium` entitlement attached, `default` offering published
- [ ] `REVENUECAT_WEBHOOK_AUTH` secret matches the Authorization header in RC dashboard webhook config
- [ ] Test account starts with `profiles.subscription_tier = 'free'`, `subscription_active = false`

### 1. Paywall display
- [ ] Paywall opens from every premium gate (locked commodity card, premium upsell, etc.)
- [ ] `availablePackages` renders Monthly + Annual with correct localised `priceString`
- [ ] Annual shows "Best value · Save ~38%" badge
- [ ] On non-native (web preview) shows the "Android app only" message
- [ ] Loading spinner appears while offerings fetch; no flash of empty state

### 2. Purchase flow — Monthly
- [ ] Tap Monthly → Google Play sheet opens with correct price + "Test card, always approves"
- [ ] Complete purchase → toast "Welcome to Premium!"
- [ ] Paywall closes automatically
- [ ] `auth.refreshProfile()` fires; UI flips to premium without manual reload
- [ ] Premium-gated commodities/features are now accessible
- [ ] **DB check**: `profiles.subscription_tier='premium'`, `subscription_active=true`, `subscription_end` ≈ now + 5 min (license-test renewal cadence)
- [ ] **Webhook log**: edge function log shows `RC INITIAL_PURCHASE for <user> → matched 1 row(s)`

### 3. Purchase flow — Annual
- [ ] Same as above with Annual package
- [ ] `subscription_end` reflects annual term

### 4. Restore purchases
- [ ] Uninstall + reinstall app (same Google account)
- [ ] Open paywall → tap "Restore previous purchase"
- [ ] Toast "Purchases restored"
- [ ] Profile flips back to premium without re-paying
- [ ] If account has no prior purchase → toast "Nothing to restore"

### 5. Cancellation
- [ ] Play Store → Subscriptions → cancel premium
- [ ] App still shows premium until period end (expected — entitlement active)
- [ ] After expiry (~5 min on license test): webhook `EXPIRATION` fires
- [ ] **DB check**: `subscription_tier='free'`, `subscription_active=false`
- [ ] Premium UI re-locks on next `refreshProfile`

### 6. Uncancellation / resubscribe
- [ ] Resubscribe before expiry → `UNCANCELLATION` webhook → still premium
- [ ] Resubscribe after expiry → `INITIAL_PURCHASE` (or `RENEWAL`) → flips back to premium

### 7. Edge cases
- [ ] Cancel mid-purchase (close Play sheet) → no toast error spam, no DB write, button re-enabled
- [ ] Network offline during purchase → graceful error toast, no partial state
- [ ] Two devices same account: purchase on A, open B → restore works
- [ ] Account switch (sign out → sign in as different user) → premium does NOT leak to new user
- [ ] App backgrounded mid-purchase then resumed → completes correctly

### 8. Webhook robustness
- [ ] Wrong `Authorization` header → 401
- [ ] Malformed JSON → 400
- [ ] Event with no `entitlement_ids` matching `premium` → 200 ignored
- [ ] `BILLING_ISSUE` → flips to free (grace handling acceptable for v1)
- [ ] `TRANSFER` event → new `app_user_id` becomes premium, old one untouched
- [ ] Edge function logs show no 500s across all test events

### 9. Compliance & store
- [ ] Paywall lists subscription length, price, and auto-renewal in plain text (Play policy)
- [ ] "Restore purchase" button visible (Play policy)
- [ ] Privacy Policy + Terms accessible from paywall or settings
- [ ] Data Safety form in Play Console declares `purchaseHistory` collection
- [ ] Subscription products marked as such in Play Console (not one-time)

### 10. Final go/no-go
- [ ] All boxes above checked on at least 2 devices (1 phone, 1 tablet or different OEM)
- [ ] Revert any test users back to `free` in DB before promoting to production track
- [ ] Promote AAB from Internal → Production (or Closed testing first)

### Deliverable
Save as `/mnt/documents/revenuecat-prelaunch-qa.md` for download.
