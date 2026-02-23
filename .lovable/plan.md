
The signed Android App Bundle (AAB) is not stored in the source code directory because it is a **compiled build artifact**, not a source file. It is generated during the Android build process and is typically excluded from version control (git) to keep the repository clean and secure.

To obtain your AAB for the Google Play Console, you need to perform an Android build. Since this requires the Android SDK and Gradle, it is typically done on your local machine rather than in the cloud editor.

### Where it will be located
Once the build is successful, the AAB will be generated at:
`android/app/build/outputs/bundle/release/app-release.aab`

### How to generate your Signed AAB

To generate the file, follow these steps on your local computer:

1. **Download your project code**: Use the "Export" or "Download" feature in Lovable to get the latest source code.
2. **Install requirements**: Ensure you have Node.js, the Android SDK, and Android Studio installed.
3. **Prepare the build**:
   ```bash
   npm install
   npm run build  # Creates the 'dist' folder
   npx cap copy android # Copies the web assets to the Android project
   ```
4. **Build the AAB in Android Studio**:
   - Open the `android` folder in Android Studio.
   - Wait for Gradle to sync.
   - Go to **Build > Generate Signed Bundle / APK...**.
   - Select **Android App Bundle** and click Next.
   - Create or select your **Keystore** (the `.jks` file used for signing).
   - Select the `release` build variant.
   - Click Finish.

### Missing Configuration: google-services.json
Before you build, you will need to add your `google-services.json` file (from your Firebase Console) to the `android/app/` directory. This is required for Google Sign-In and other Google services to function correctly in the production app.

### Technical Details
- **Build Tool**: Gradle (the standard Android build system).
- **File Format**: `.aab` (Android App Bundle), which is now the required format for new apps on the Google Play Store (replacing `.apk`).
- **Signing**: The "signed" part refers to using a private cryptographic key (keystore) to verify that the app was created by you. This is a security requirement for the Play Store.

If you have already performed a build locally and still can't find it, ensure that you selected "Bundle" and not "APK" during the generation process.
