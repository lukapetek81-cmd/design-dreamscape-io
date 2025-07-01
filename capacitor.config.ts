
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
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreKeyPassword: undefined,
      signingType: 'apksigner',
      sourceCompatibility: '17',
      targetCompatibility: '17',
      javaVersion: '17'
    },
    compileSdkVersion: 34,
    minSdkVersion: 22,
    targetSdkVersion: 34,
    javaVersion: '17',
    gradleProperties: {
      'android.useAndroidX': 'true',
      'android.enableJetifier': 'true',
      'org.gradle.jvmargs': '-Xmx2048m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8',
      'org.gradle.parallel': 'false',
      'org.gradle.caching': 'false',
      'org.gradle.configureondemand': 'false',
      'org.gradle.java.home': '/usr/lib/jvm/java-17-openjdk-amd64',
      'android.enableR8.fullMode': 'false',
      'android.disableAutomaticComponentCreation': 'true',
      'android.nonTransitiveRClass': 'false',
      'android.nonFinalResIds': 'false'
    }
  }
};

export default config;
