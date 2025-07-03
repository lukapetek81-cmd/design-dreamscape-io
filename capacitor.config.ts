
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
      javaVersion: '17',
      releaseSourceCompatibility: '17',
      releaseTargetCompatibility: '17',
      debugSourceCompatibility: '17',
      debugTargetCompatibility: '17'
    },
    compileSdkVersion: 34,
    minSdkVersion: 22,
    targetSdkVersion: 34,
    javaVersion: '17',
    gradleProperties: {
      'android.useAndroidX': 'true',
      'android.enableJetifier': 'true',
      'org.gradle.jvmargs': '-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8',
      'org.gradle.parallel': 'false',
      'org.gradle.caching': 'false',
      'org.gradle.configureondemand': 'false',
      
      'android.enableR8.fullMode': 'false',
      'android.disableAutomaticComponentCreation': 'true',
      'android.nonTransitiveRClass': 'false',
      'android.nonFinalResIds': 'false',
      'org.gradle.daemon': 'false',
      'org.gradle.debug': 'false',
      'android.enableDexingArtifactTransform': 'false',
      'android.dependency.useJavaLibraryVariants': 'false',
      'android.dependencyResolutionAtConfigurationTime.disallow': 'false',
      'org.gradle.unsafe.configuration-cache': 'false',
      'android.suppressUnsupportedOptionWarnings': 'true',
      // Force Java 17 compilation and prevent Java 21
      'java.sourceCompatibility': 'JavaVersion.VERSION_17',
      'java.targetCompatibility': 'JavaVersion.VERSION_17',
      'kotlin.jvm.target.validation.mode': 'warning',
      'java.vendor': 'openjdk',
      'java.version': '17',
      'java.specification.version': '17',
      'java.vm.specification.version': '17',
      'java.class.version': '61.0',
      // Gradle JVM version enforcement
      'org.gradle.java.installations.auto-detect': 'false',
      'org.gradle.java.installations.auto-download': 'false',
      // Force Java 17 for ALL compilation tasks including Capacitor modules
      'android.defaults.buildfeatures.buildconfig': 'false',
      'android.defaults.buildfeatures.aidl': 'false',
      'android.defaults.buildfeatures.renderscript': 'false',
      'android.defaults.buildfeatures.resvalues': 'false',
      'android.defaults.buildfeatures.shaders': 'false',
      // Override any Java version specifications
      'org.gradle.java.home': '',
      'capacitor.android.sourceCompatibility': '17',
      'capacitor.android.targetCompatibility': '17',
      'capacitor.android.compileSdkVersion': '34'
    }
  }
};

export default config;
