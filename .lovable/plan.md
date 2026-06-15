## Premium v2 Sprint

Audit shows ~60% of this work is already done. Plan focuses on the missing glue.

### Current state
- ✅ `evaluate-price-alerts` edge function exists (cron-ready, auth-gated)
- ✅ `usePortfolios` / `useCreatePortfolio` / multi-portfolio UI exists in `Portfolio.tsx`
- ✅ `downloadCsv` util + portfolio CSV export wired and tier-gated
- ❌ No push notification delivery (no FCM, no device-token storage, no Capacitor plugin)
- ❌ `evaluate-price-alerts` not scheduled by pg_cron
- ❌ CSV export not exposed on Watchlists or Alert history
- ⚠️ Multi-portfolio UI missing rename + move-position-between-portfolios

---

### 1. Push alerts (biggest piece)

**Native side**
- Add `@capacitor/push-notifications` dependency
- New hook `src/hooks/usePushNotifications.ts` — on app boot (logged-in users only): request permission, register, upsert token to `device_tokens` table; listen for `pushNotificationReceived` → in-app toast; `pushNotificationActionPerformed` → navigate to `/price-alerts`
- Wire into `App.tsx` after auth ready
- Web fallback: use browser `Notification` API + in-app `AlertNotificationBell` (already exists) — no FCM on web

**Database** (migration)
- New table `public.device_tokens` (id, user_id, token unique, platform `ios|android|web`, created_at, last_seen_at). Standard RLS: user can CRUD own; service_role full. GRANTs included.
- Schedule pg_cron via insert tool (not migration — contains anon key):
  - `evaluate-price-alerts` every 5 min, Mon–Fri 13:00–21:00 UTC (commodities-hours window) using `ALERT_EVALUATOR_SECRET`

**Edge function**
- Add new `send-push` edge function: takes `{ user_id, title, body, data }`, looks up tokens, calls FCM HTTP v1 API (needs `FCM_SERVICE_ACCOUNT_JSON` secret — will prompt user)
- Modify `evaluate-price-alerts`: after inserting trigger row, invoke `send-push` with alert details

**Settings UI**
- Toggle "Push notifications" in `Settings.tsx` (gated by Premium); revoke removes token row

---

### 2. CSV export expansion

- Add export button to `Watchlists` page → uses existing `downloadCsv`, same Premium gate
- Add export button to `PriceAlerts` page → exports active alerts + 90-day trigger history
- Add server-side `audit_logs.log_csv_export()` call for Play Store data-export compliance
- Reuse existing `PremiumPaywall` modal pattern from Portfolio

---

### 3. Multi-portfolio polish

- Add **Rename portfolio** dialog in `Portfolio.tsx` header (next to delete)
- Add **Move position** action in `PositionCard` — dropdown listing other portfolios; updates `portfolio_id` (RLS already validates ownership via `ensure_default_portfolio` trigger)
- Add aggregate "All portfolios" virtual view option in selector for Premium+ — shows combined P&L across all portfolios (read-only, no add/edit)
- Hook: extend `usePortfolios` with `useRenamePortfolio` + `useMovePosition` mutations

---

### Technical details

**Files to add**
- `src/hooks/usePushNotifications.ts`
- `src/components/RenamePortfolioDialog.tsx`
- `src/components/MovePositionMenu.tsx`
- `supabase/functions/send-push/index.ts`
- `supabase/migrations/<ts>_device_tokens.sql`

**Files to edit**
- `src/App.tsx` (mount push hook)
- `src/pages/Portfolio.tsx` (rename + all-portfolios view)
- `src/components/PositionCard.tsx` (move menu)
- `src/pages/Watchlists.tsx` (CSV button)
- `src/pages/PriceAlerts.tsx` (CSV button)
- `src/pages/Settings.tsx` (push toggle)
- `supabase/functions/evaluate-price-alerts/index.ts` (invoke send-push)
- `package.json` (+ `@capacitor/push-notifications`)

**Secrets to add** (will prompt before coding edge function)
- `FCM_SERVICE_ACCOUNT_JSON` — Firebase service account JSON for FCM HTTP v1
- `ALERT_EVALUATOR_SECRET` — random string for cron auth

**Out of scope**
- iOS APNs setup (Android-only push for v2; iOS deferred)
- Smart-alert types (volatility/spread/news) — already exist, no new work
- Stripe web checkout — RevenueCat IAP remains the only paid path
- Price drop from $19.99 (separate decision)

---

### Suggested commit order
1. Migration + cron schedule (DB ready)
2. `send-push` edge function + secret prompt
3. `evaluate-price-alerts` integration
4. Capacitor plugin + `usePushNotifications` + Settings toggle
5. Multi-portfolio rename/move/all-view
6. CSV export buttons on Watchlists + PriceAlerts

Ready to switch to build mode and start with step 1?
