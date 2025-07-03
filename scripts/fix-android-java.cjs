#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Android Java version settings...');

// Check if Android platform exists
const androidPath = path.join('android');
if (!fs.existsSync(androidPath)) {
  console.log('❌ Android platform not found. Run "npx cap add android" first.');
  process.exit(1);
}

// Function to fix app build.gradle
function fixAppBuildGradle() {
  const buildGradlePath = path.join('android', 'app', 'build.gradle');
  
  if (!fs.existsSync(buildGradlePath)) {
    console.log('⚠️  app/build.gradle not found, skipping...');
    return;
  }
  
  let content = fs.readFileSync(buildGradlePath, 'utf8');
  
  // Replace Java version references
  content = content.replace(/JavaVersion\.VERSION_21/g, 'JavaVersion.VERSION_17');
  content = content.replace(/JavaVersion\.VERSION_1_8/g, 'JavaVersion.VERSION_17');
  
  // If there's no compileOptions section, add it
  if (!content.includes('compileOptions')) {
    const androidBlockRegex = /(android\s*\{)/;
    if (androidBlockRegex.test(content)) {
      content = content.replace(androidBlockRegex, `$1
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }`);
    }
  } else {
    // Update existing compileOptions
    content = content.replace(
      /compileOptions\s*\{[^}]*\}/s,
      `compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }`
    );
  }
  
  fs.writeFileSync(buildGradlePath, content);
  console.log('✅ Fixed app/build.gradle');
}

// Function to fix capacitor.build.gradle
function fixCapacitorBuildGradle() {
  const capacitorBuildPath = path.join('android', 'capacitor.build.gradle');
  
  if (!fs.existsSync(capacitorBuildPath)) {
    console.log('⚠️  capacitor.build.gradle not found, skipping...');
    return;
  }
  
  let content = fs.readFileSync(capacitorBuildPath, 'utf8');
  
  // Replace any Java 21 references with Java 17
  content = content.replace(/JavaVersion\.VERSION_21/g, 'JavaVersion.VERSION_17');
  content = content.replace(/jvmTarget\s*=\s*"21"/g, 'jvmTarget = "17"');
  content = content.replace(/jvmTarget\s*=\s*21/g, 'jvmTarget = 17');
  
  fs.writeFileSync(capacitorBuildPath, content);
  console.log('✅ Fixed capacitor.build.gradle');
}

// Function to fix variables.gradle
function fixVariablesGradle() {
  const variablesPath = path.join('android', 'variables.gradle');
  
  if (!fs.existsSync(variablesPath)) {
    console.log('⚠️  variables.gradle not found, skipping...');
    return;
  }
  
  let content = fs.readFileSync(variablesPath, 'utf8');
  
  // Force compile SDK versions
  content = content.replace(/compileSdkVersion\s*=\s*\d+/g, 'compileSdkVersion = 35');
  content = content.replace(/targetSdkVersion\s*=\s*\d+/g, 'targetSdkVersion = 35');
  
  fs.writeFileSync(variablesPath, content);
  console.log('✅ Fixed variables.gradle');
}

// Main execution
try {
  fixAppBuildGradle();
  fixCapacitorBuildGradle();
  fixVariablesGradle();
  console.log('🎉 Android Java version fix completed!');
} catch (error) {
  console.error('❌ Error fixing Android Java version:', error);
  process.exit(1);
}