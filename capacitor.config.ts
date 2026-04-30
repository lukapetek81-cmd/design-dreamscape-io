
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable._0cea242b6aba4f5a9e4991997ef3b761',
  appName: 'Commodity Hub',
  webDir: 'dist',
  // PRODUCTION MODE: bundled `dist/` is loaded from the APK/AAB.
  // To switch back to dev/live-reload, restore the `server` block:
  //   server: {
  //     url: 'https://0cea242b-6aba-4f5a-9e49-91997ef3b761.lovableproject.com?forceHideBadge=true',
  //     cleartext: true,
  //   },
  // and set allowMixedContent / webContentsDebuggingEnabled back to true below.
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1e3a5f",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff"
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#1e3a5f"
    }
  },
  android: {
    compileSdkVersion: 35,
    minSdkVersion: 22,
    targetSdkVersion: 35,
    iconDensity: 'mdpi',
    adaptiveIcon: {
      foreground: 'icon.png',
      background: '#1e3a5f'
    },
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  ios: {
    contentInset: 'automatic',
    icon: 'icon.png',
    scheme: 'commodityhub',
    allowsLinkPreview: false
  },
  // Global icon configuration
  icon: 'icon.png'
};

export default config;
