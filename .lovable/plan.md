

# Complete Guide: Generate Signed AAB and Upload to Google Play Console

## Part 1: Prepare the Web Build

Run these commands in your terminal from the **root project folder**:

```text
npm install
npm run build
npx cap copy android
```

This compiles your web app and copies the built assets into the Android project.

## Part 2: Generate Signed AAB in Android Studio

### Step 1: Open the Android Project
- Open Android Studio
- Click **File > Open**
- Navigate to your project and select **only the `android` folder** (not the root)
- Wait for Gradle sync to complete (watch the bottom status bar until it's idle)

### Step 2: Generate Signed Bundle
- Go to **Build > Generate Signed Bundle / APK...**
- Select **Android App Bundle** and click **Next**

### Step 3: Configure Signing

If you **already have a keystore**:
- Click the folder icon next to "Key store path" and select your `.keystore` or `.jks` file
- Enter the **Key store password**, **Key alias**, and **Key password**

If you **need to create a new keystore**:
- Click **Create new...**
- Choose a location and filename (e.g., `commodity-hub.keystore`)
- Set a strong password for both the keystore and key
- Set the Key alias to something like `upload-key`
- Fill in at least one field under Certificate (e.g., your name or organization)
- Click **OK**

**IMPORTANT**: Save your keystore file and passwords somewhere safe. You will need them for every future update. If you lose them, you cannot update your app.

### Step 4: Build the Bundle
- Select **release** as the build variant
- Click **Finish**
- Wait for the build to complete
- The signed AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

## Part 3: Upload to Google Play Console

### Step 1: Navigate to Your App
- Go to [play.google.com/console](https://play.google.com/console)
- Select your app (**Commodity Hub**)

### Step 2: Enable Play App Signing (first time only)
- Go to **Setup > App signing** in the left menu
- Accept and enable **Google Play App Signing**
- This lets Google manage your distribution key while you keep your upload key

### Step 3: Create a Release
- In the left menu, go to **Testing > Internal testing** (recommended for first upload) or **Production**
- Click **Create new release**

### Step 4: Upload the AAB
- Click the **Upload** button
- Select the `app-release.aab` file from `android/app/build/outputs/bundle/release/`
- Wait for the upload to complete and for Google to process it

### Step 5: Complete Release Details
- Add **Release notes** (e.g., "Initial release of Commodity Hub")
- Click **Review release**
- Fix any warnings or errors shown
- Click **Start rollout** (for internal testing) or **Start rollout to production**

## Recommended Release Order

Start with testing tracks before going to production:

```text
1. Internal testing  -->  Share with up to 100 testers via email
2. Closed testing    -->  Larger group of testers
3. Open testing      -->  Anyone can join
4. Production        -->  Available to all users on Google Play
```

Internal testing does not require a full store review, so it's the fastest way to verify everything works on real devices.

## Troubleshooting

- **"Generate Signed Bundle" is grayed out**: Make sure you opened the `android` folder (not root) and Gradle sync completed successfully
- **Build fails**: Run `./gradlew clean` (or `gradlew.bat clean` on Windows) from the `android` folder, then try again
- **Upload rejected by Play Console**: Check that `versionCode` in `android/app/build.gradle` is higher than any previously uploaded version

