## Two Play Console errors to fix

### 1. Version code already used
Bump `versionCode` from `1` → `2` (and `versionName` to `"1.0.1"`) in `android/app/build.gradle`. Every upload to Play Console must have a higher `versionCode` than any previous upload — even rejected ones count.

### 2. Package name mismatch
Your Play Console listing was created with package name:
```
app.lovable.c8fabd7a96c74aff8d7b001690ec23c7
```
But the Android project currently uses:
```
com.commodityhub.app
```
Once a Play Console listing is created, the package name is **locked forever**. You have two options:

**Option A — Change the app to match the listing (fastest)**
Update `applicationId` and `namespace` in `android/app/build.gradle`, the `appId` in `capacitor.config.ts`, the Java package folder `android/app/src/main/java/com/commodityhub/app/` → `android/app/src/main/java/app/lovable/c8fabd7a96c74aff8d7b001690ec23c7/`, and the `package` line in `MainActivity.java`. Also update `custom_url_scheme` and `package_name` in `strings.xml`.

Note: the leading segment after `lovable.` starts with a digit (`c8fabd...` is fine, but if it were a pure number Java would need a leading underscore — your UUID starts with `c` so it's valid as-is).

**Option B — Create a new Play Console listing with `com.commodityhub.app`**
Delete or abandon the existing draft listing in Play Console, create a fresh app entry using package name `com.commodityhub.app`, then upload. This keeps your current branding/package but you redo the listing setup (store description, screenshots, etc.).

### Which to choose?
- If you've barely set up the Play Console listing → **Option B** (cleaner, keeps `com.commodityhub.app`)
- If you've filled in lots of listing details (descriptions, screenshots, data safety form) → **Option A** (preserves the listing)

### Files that change for Option A
- `android/app/build.gradle` — `namespace`, `applicationId`, `versionCode`, `versionName`
- `capacitor.config.ts` — `appId`
- `android/app/src/main/AndroidManifest.xml` — verify no hardcoded package
- `android/app/src/main/java/com/commodityhub/app/MainActivity.java` — move file + change `package` declaration
- `android/app/src/main/res/values/strings.xml` — `package_name`, `custom_url_scheme`
- Uninstall any prior debug APK from your device before reinstalling (Android treats a changed `applicationId` as a new app)

### After either option
Run locally:
```bash
npm run build
npx cap sync android
cd android && ./gradlew :app:bundleRelease
```
Upload `android/app/build/outputs/bundle/release/app-release.aab`.

**Which option do you want — A (rename app to match listing) or B (new listing with current package name)?**
