

# Google Play Console Setup Guide

This plan covers completing all required sections in the Google Play Console to publish Commodity Hub.

## 1. Store Listing

The app already has assets prepared. Here's what to use:

**App Details:**
- **App name**: Commodity Hub - Trading Analytics
- **Short description** (80 chars max): Professional commodity trading platform with real-time data and analytics
- **Full description**: Use the content from `src/components/app-store/AppStoreAssets.tsx` (APP_STORE_DESCRIPTION.full)

**Graphics:**
- **App icon** (512x512): `public/icons/icon-512-playstore.png`
- **Feature graphic** (1024x500): `public/store-assets/feature-graphic.png`
- **Phone screenshots**: The 5 images in `public/screenshots/phone-*.png`
- **Tablet screenshots**: The 2 images in `public/screenshots/tablet-*.png`

## 2. Content Rating Questionnaire

Answer the IARC questionnaire as follows:
- **Category**: Utility / Productivity / Finance
- **Violence**: No
- **Sexual content**: No
- **Language**: No
- **Controlled substances**: No
- **Simulated gambling**: Yes (trading simulations involve risk)
- **User-generated content**: Yes (community features)
- **Personal data sharing**: Yes (account creation, analytics)

This should result in a **Teen (13+)** rating.

## 3. Data Safety Section

Based on the app's data collection (from `src/utils/playStoreCompliance.ts`):

| Data Type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Email address | Yes | No | Account management |
| Name | Yes | No | Account management |
| User IDs | Yes | No | App functionality |
| Purchase history | Yes | No | App functionality |
| App interactions | Yes | No | Analytics |
| Device ID | Yes | No | Analytics |

**Security practices:**
- Data encrypted in transit: Yes
- Data encrypted at rest: Yes
- Users can request deletion: Yes

## 4. Target Audience & Content

- **Target age group**: 13 and above
- **Appeals to children**: No
- **Contains ads**: No (set `containsAds: false` in metadata)

## 5. App Access

- Select **"All or some functionality is restricted"**
- Provide test credentials or note that a Google Sign-In account is needed
- If features require premium, note which ones are gated

## 6. Ads Declaration

- Select **"No, my app does not contain ads"**
- (AdMob is configured but if not actively showing ads yet, declare No)

## 7. App Category & Contact

- **Category**: Finance
- **Email**: support@commodityhub.com
- **Website**: Your published Lovable URL
- **Privacy policy**: Your published URL + `/privacy-policy`

## 8. Pricing & Distribution

- **Free** with in-app purchases ($4.99 - $19.99)
- **Countries**: Select all target countries (US, CA, GB, AU, DE, FR, JP, SG as configured)

## 9. Release Setup

- Go to **Production > Create new release**
- Enable **Google Play App Signing** (recommended)
- Upload the signed AAB from `android/app/build/outputs/bundle/release/app-release.aab`
- Release name: `1.0.0`
- Release notes: Use content from `RELEASE_NOTES` in AppStoreAssets.tsx

## 10. Review & Submit

After completing all sections, the dashboard will show green checkmarks. Click **"Send for review"**. Google typically reviews within 1-3 days for new apps.

## Code Changes Needed

**No code changes are required.** All assets and metadata are already in the codebase. This is purely a Google Play Console configuration task using the existing assets.

