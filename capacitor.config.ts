
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c8fabd7a96c74aff8d7b001690ec23c7',
  appName: 'Commodity Hub',
  webDir: 'dist',
  // Remove server config for production build
  // server: {
  //   url: "https://c8fabd7a-96c7-4aff-8d7b-001690ec23c7.lovableproject.com?forceHideBadge=true",
  //   cleartext: true
  // },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#8B5CF6",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff"
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#8B5CF6"
    },
    AdMob: {
      appId: 'ca-app-pub-8597609154479605~4310240399',
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
    allowMixedContent: false, // Set to false for production
    captureInput: true,
    webContentsDebuggingEnabled: false // Set to false for production
  },
  ios: {
    contentInset: 'automatic',
    icon: 'icon.png',
    scheme: 'Commodity Hub',
    allowsLinkPreview: false
  },
  // Global icon configuration
  icon: 'icon.png'
};

export default config;
