
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c8fabd7a96c74aff8d7b001690ec23c7',
  appName: 'Commodity Hub',
  webDir: 'dist',
  server: {
    url: 'https://c8fabd7a-96c7-4aff-8d7b-001690ec23c7.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a202c",
      showSpinner: false
    }
  },
  android: {
    compileSdkVersion: 35,
    minSdkVersion: 22,
    targetSdkVersion: 35,
    iconBackgroundColor: '#1a202c',
    iconForegroundColor: '#ffffff'
  }
};

export default config;
