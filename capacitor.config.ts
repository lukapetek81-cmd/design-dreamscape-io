
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c8fabd7a96c74aff8d7b001690ec23c7',
  appName: 'price-whisper-android',
  webDir: 'dist',
  server: {
    url: 'https://c8fabd7a-96c7-4aff-8d7b-001690ec23c7.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: null,
      keystoreAlias: null,
      keystorePassword: null,
      keystoreKeyPassword: null,
      signingType: 'apksigner',
      sourceCompatibility: '17',
      targetCompatibility: '17'
    },
    compileSdkVersion: 34,
    minSdkVersion: 22,
    targetSdkVersion: 34,
    javaVersion: '17'
  },
};

export default config;
