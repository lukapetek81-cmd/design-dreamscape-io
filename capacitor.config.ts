
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c8fabd7a96c74aff8d7b001690ec23c7',
  appName: 'Commodity Hub',
  webDir: 'dist',
  server: {
    url: "https://c8fabd7a-96c7-4aff-8d7b-001690ec23c7.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#663399",
      showSpinner: false
    }
  },
  android: {
    compileSdkVersion: 35,
    minSdkVersion: 22,
    targetSdkVersion: 35,
    iconDensity: 'mdpi',
    adaptiveIcon: {
      foreground: 'icon.png',
      background: '#8B5CF6'
    }
  },
  ios: {
    contentInset: 'automatic',
    icon: 'icon.png'
  },
  // Global icon configuration
  icon: 'icon.png'
};

export default config;
