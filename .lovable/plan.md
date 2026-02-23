

# Fix: Generate Signed Bundle in Android Studio

## The Problem

The **"Generate Signed Bundle / APK"** option is grayed out because you opened the **root project folder** in Android Studio. Android Studio only enables this option when it recognizes the project as an Android project, which requires opening the `android` subfolder directly.

## No Code Changes Needed

This is a setup issue, not a code issue. Here are the corrected steps:

## Steps to Fix

1. **Close the current project** in Android Studio (File > Close Project)

2. **Prepare the web build first** (in your terminal, from the root project folder):
   ```
   npm install
   npm run build
   npx cap copy android
   ```

3. **Open Android Studio** and click **"Open"**

4. **Navigate to and select ONLY the `android` folder** inside your project -- not the root folder

5. **Wait for Gradle sync** to complete (you'll see a progress bar at the bottom). This may take a few minutes the first time.

6. Once sync is complete, go to **Build > Generate Signed Bundle / APK...** -- it should now be clickable

7. Select **Android App Bundle**, click Next

8. Create a new keystore or select your existing one, fill in the credentials, and click Finish

9. The signed AAB will be generated at:
   `android/app/build/outputs/bundle/release/app-release.aab`

## Important Notes

- Always run `npm run build` and `npx cap copy android` **before** opening in Android Studio, so the latest web assets are included
- If Gradle sync fails, check that you have the correct Android SDK version (SDK 35) installed via Android Studio's SDK Manager
- You do **not** need the `google-services.json` file to build -- the existing `build.gradle` handles its absence gracefully

