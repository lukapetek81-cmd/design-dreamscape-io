## Root cause found

The "publish or update your Lovable project" placeholder is not a WebView/asset issue — it's caused by a **project-ID mismatch** between your Capacitor config and the actual sandbox host.

| Place | UUID being used |
|---|---|
| `capacitor.config.ts` → `appId` | `c8fabd7a96c74aff8d7b001690ec23c7` |
| `capacitor.config.ts` → `server.url` | `0cea242b-6aba-4f5a-9e49-91997ef3b761` |
| Actual project preview URL | `0cea242b-6aba-4f5a-9e49-91997ef3b761` |
| Android `applicationId` / `namespace` / `package_name` | `c8fabd7a96c74aff8d7b001690ec23c7` |

When the WebView loads `https://0cea242b-….lovableproject.com`, the Lovable sandbox checks the requesting app's identity against the project that owns that UUID. Because the Android package is `…c8fabd7a…` (a different project), the sandbox refuses to serve the live app and shows the **"publish or update your Lovable project"** placeholder instead.

Launcher icons, manifest, AndroidManifest.xml, splash screen, and WebView config are all fine — the problem is purely the identity mismatch.

## Plan to fix

1. **Align `capacitor.config.ts` `appId`** to match this project:
   - Change `app.lovable.c8fabd7a96c74aff8d7b001690ec23c7` → `app.lovable.0cea242b6aba4f5a9e4991997ef3b761`

2. **Update Android native identifiers** to the same value:
   - `android/app/build.gradle` → `namespace` and `applicationId`
   - `android/app/src/main/res/values/strings.xml` → `package_name` and `custom_url_scheme`
   - Rename the Java/Kotlin package directory under `android/app/src/main/java/app/lovable/…` to the new UUID folder (and update `package` declaration in `MainActivity`).

3. **Verify launcher icon assets** are present in every mipmap density (they are — `ic_launcher.png`, `ic_launcher_round.png`, `ic_launcher_foreground.png` exist in `mipmap-hdpi…xxxhdpi` and `mipmap-anydpi-v26`). No regeneration needed.

4. **Document the rebuild step** the user must perform locally:
   - `git pull`
   - `npx cap sync android`
   - In Android Studio: **Build → Clean Project**, then **Rebuild**, then reinstall the APK (uninstall the old one first, since the package name is changing).

## Important caveat for the user

Because step 2 changes the Android `applicationId`, the rebuilt app is treated as a **brand-new app** by Android:
- You must **uninstall** the existing test APK before installing the new one.
- If this `applicationId` is already what you registered in **Google Play Console**, changing it will break the Play listing — in that case we'd instead change the `server.url` UUID (but that UUID is fixed by which Lovable project you're editing, so it can't be changed). Confirm whether the Play Console entry was created yet.

## Why not just change `server.url` instead?

The sandbox URL UUID is bound to this Lovable project and cannot be reassigned. The native package ID is the only side that's flexible, so we align it to the project.

## Files to change (technical)

- `capacitor.config.ts` — `appId`
- `android/app/build.gradle` — `namespace`, `applicationId`
- `android/app/src/main/res/values/strings.xml` — `package_name`, `custom_url_scheme`
- `android/app/src/main/java/app/lovable/c8fabd7a96c74aff8d7b001690ec23c7/MainActivity.java` (or `.kt`) — move to new package path, update `package` line
- `PRODUCTION_SETUP.md` — note the package-ID change and uninstall-before-reinstall step