# Production Environment Setup Guide

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