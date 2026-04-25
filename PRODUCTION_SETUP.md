# Production Environment Setup Guide

## Android Package ID

The native Android `applicationId` and Capacitor `appId` are:

```
app.lovable._0cea242b6aba4f5a9e4991997ef3b761
```

This UUID matches the Lovable project that owns the live-reload sandbox URL. If the package ID does not match the project that owns the `lovableproject.com` URL, the WebView will display a **"publish or update your Lovable project"** placeholder instead of your app.

The leading underscore is required because Java package segments cannot start with a digit.

**If you change this ID**, you must:
1. Uninstall the existing test APK from the device first (Android treats a changed `applicationId` as a brand-new app).
2. Update the same value in Google Play Console — once an app is published, the `applicationId` is locked and cannot be changed there.

## Capacitor Build Modes (READ FIRST)

`capacitor.config.ts` has two modes — switch before building the APK:

### Dev mode (current) — live reload from Lovable
The `server.url` block is enabled, pointing at the Lovable preview. The installed APK loads your live app over HTTPS — every code change in Lovable appears instantly on the phone with no rebuild.
- `allowMixedContent: true`
- `webContentsDebuggingEnabled: true`
- Use for: day-to-day testing on a physical device.
- Limitation: Google OAuth deep-link (`commodityhub://auth-callback`) won't fully round-trip in this mode — verify OAuth in production mode.

### Production mode — bundled `dist/` (Play Store)
Before generating the signed AAB:
1. Comment out the `server` block in `capacitor.config.ts`
2. Set `allowMixedContent: false` and `webContentsDebuggingEnabled: false`
3. Run `npm run build && npx cap sync android`
4. Build the signed release in Android Studio

After making changes in either direction, run `git pull` locally, then `npx cap sync android`, then rebuild the APK in Android Studio.

## Critical Production URLs & Services

### Health Check Endpoint
- **URL**: `https://your-domain.com/health`
- **Purpose**: System health monitoring for uptime services
- **Implementation**: Edge function already created

### API Rate Limits
- **FMP API**: Upgrade to paid plan (5000+ requests/day)
- **Alpha Vantage**: Monitor usage and upgrade if needed
- **Marketaux**: Consider premium for real-time news

### External Monitoring Services
- **Uptime Robot**: Monitor health endpoint
- **New Relic/DataDog**: Application performance monitoring
- **Sentry**: Error tracking and crash reporting

### Production Environment Variables
```bash
# In Supabase Edge Functions
FMP_API_KEY=your_production_fmp_key
ALPHA_VANTAGE_API_KEY=your_production_alpha_key
STRIPE_SECRET_KEY=your_production_stripe_key
ALERT_WEBHOOK_URL=your_monitoring_webhook
```

### Security Configuration
- Enable 2FA on all service accounts
- Set up API key rotation schedule
- Configure CORS for production domains only
- Enable rate limiting on all public endpoints

### Performance Optimization
- Configure CDN (Cloudflare/AWS CloudFront)
- Enable compression and caching
- Optimize image delivery
- Set up database connection pooling

### Backup & Recovery
- Configure automated database backups
- Set up point-in-time recovery
- Test disaster recovery procedures
- Document recovery workflows

## Launch Day Checklist
1. ✅ Database migrated and optimized
2. ⚠️ Security linter issues resolved
3. ⚠️ Production API keys configured
4. ⚠️ Monitoring and alerting active
5. ⚠️ Google Play Store listing ready
6. ⚠️ SSL certificates and custom domain
7. ⚠️ Performance testing completed
8. ⚠️ Backup and recovery tested