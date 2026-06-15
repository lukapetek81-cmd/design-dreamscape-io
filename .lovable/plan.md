## Goal

Stop the Android startup crash by completing the Firebase configuration that `@capacitor/push-notifications` requires, and harden the JS side so a missing/broken Firebase config never crashes the app again.

## Root cause (recap)

`@capacitor/push-notifications` merges a `FirebaseMessagingService` and `FirebaseInitProvider` into `AndroidManifest.xml`. The `FirebaseInitProvider` runs before any JS, calls `FirebaseApp.initializeApp()`, and reads `google-services.json`. The file is missing, so the process crashes immediately on launch. Your `app/build.gradle` already conditionally applies `com.google.gms.google-services`, so adding the file is the only missing piece at the Gradle level — but auto-init in the manifest is what's actually killing the app.

## You provide (one-time, outside the codebase)

1. Create a Firebase project at https://console.firebase.google.com (free Spark plan is fine).
2. Add an Android app with package name **`app.lovable.c8fabd7a96c74aff8d7b001690ec23c7`** (must match `capacitor.config.ts` exactly — case-sensitive).
3. Download the generated **`google-services.json`** and place it at **`android/app/google-services.json`** in your local clone after `git pull`. Do not commit secrets you care about — this file contains only public client IDs and is the standard FCM workflow, but treat per your policy.
4. In Firebase Console → Project Settings → Cloud Messaging, note the **Server key / FCM HTTP v1 service account JSON**. We already have the `FCM_SERVICE_ACCOUNT_JSON` Supabase secret configured, so the server side is ready — just confirm it belongs to the same Firebase project you just created. If it doesn't, re-upload the new project's service account JSON to that secret.

## I will change in the codebase

### `android/app/build.gradle`
Add the Firebase BoM + messaging dependency so the runtime classpath actually contains the Firebase classes the plugin's manifest entries reference. Without these, even with `google-services.json` present, the app can crash on init:

```gradle
dependencies {
    // ...existing
    implementation platform('com.google.firebase:firebase-bom:33.5.1')
    implementation 'com.google.firebase:firebase-messaging'
}
```

### `android/app/src/main/AndroidManifest.xml`
Add **`firebase_messaging_auto_init_enabled` = false** and **`firebase_analytics_collection_enabled` = false** meta-data inside `<application>`. This prevents the FirebaseInitProvider from hard-crashing if `google-services.json` is ever missing again, and defers FCM init until our JS code explicitly calls `PushNotifications.register()` after the user is signed in.

```xml
<meta-data android:name="firebase_messaging_auto_init_enabled" android:value="false" />
<meta-data android:name="firebase_analytics_collection_enabled" android:value="false" />
```

(`@capacitor/push-notifications` enables messaging automatically when `register()` is called — these flags only stop the *manifest-driven* auto-init that runs before JS.)

### `src/hooks/usePushNotifications.ts`
Already defensive (try/catch around dynamic import + register). Add one safety net: wrap `register()` itself in its own try/catch so a Firebase init failure on the user's device logs a warning instead of bubbling. No functional change in the happy path.

### `.gitignore`
Add `android/app/google-services.json` so each developer/CI environment supplies its own file via a build step (Lovable preview doesn't need it). Update `mem://launch/android-signing` with the new "drop google-services.json into android/app/ before `npx cap sync android`" step.

## Verification flow (you run locally)

```
git pull
npm install --legacy-peer-deps         # @capacitor/push-notifications@^8 vs @capacitor/core@^7 peer warning
# drop google-services.json into android/app/
npm run build
npx cap sync android
npx cap run android
```

Expected: app launches normally; after sign-in, Android shows the notifications permission prompt; if granted, an FCM token registers via the `register-device-token` edge function. If anything still crashes, capture `adb logcat | grep -E "FirebaseApp|AndroidRuntime"` and paste the first 30 lines — the line that contains "Default FirebaseApp is not initialized" or "google-app-id" tells us exactly what's missing.

## Out of scope

- Notification icon/colors customization, channel setup, deep-link payload handling — separate task once basic delivery works.
- iOS APNs setup — not requested.
- Re-pinning `@capacitor/push-notifications` down to v7 (we keep v8 and accept the peer warning with `--legacy-peer-deps`, since v8 contains the Android 14 foreground-service fixes you want).
