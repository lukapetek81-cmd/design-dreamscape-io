#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Android Java version settings...');

// Function to ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Function to update or create build.gradle files with Java 17 settings
function fixBuildGradle() {
  const buildGradlePath = path.join('android', 'app', 'build.gradle');
  
  ensureDir(path.dirname(buildGradlePath));
  
  let buildGradleContent = '';
  if (fs.existsSync(buildGradlePath)) {
    buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');
  }
  
  // Force Java 17 compilation
  const javaCompileOptions = `
android {
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    
    compileSdk 35
    
    defaultConfig {
        minSdkVersion 22
        targetSdkVersion 35
    }
}
`;

  // If the file doesn't contain our Java settings, add them
  if (!buildGradleContent.includes('sourceCompatibility JavaVersion.VERSION_17')) {
    if (buildGradleContent.includes('android {')) {
      // Replace existing android block
      buildGradleContent = buildGradleContent.replace(
        /android\s*{[^}]*}/s,
        javaCompileOptions.trim()
      );
    } else {
      // Add android block
      buildGradleContent += '\n' + javaCompileOptions;
    }
    
    fs.writeFileSync(buildGradlePath, buildGradleContent);
    console.log('✅ Fixed app/build.gradle');
  }
}

// Function to fix capacitor.build.gradle
function fixCapacitorBuildGradle() {
  const capacitorBuildPath = path.join('android', 'capacitor.build.gradle');
  
  if (fs.existsSync(capacitorBuildPath)) {
    let content = fs.readFileSync(capacitorBuildPath, 'utf8');
    
    // Replace any Java 21 references with Java 17
    content = content.replace(/JavaVersion\.VERSION_21/g, 'JavaVersion.VERSION_17');
    content = content.replace(/java\.sourceCompatibility\s*=\s*JavaVersion\.VERSION_21/g, 'java.sourceCompatibility = JavaVersion.VERSION_17');
    content = content.replace(/java\.targetCompatibility\s*=\s*JavaVersion\.VERSION_21/g, 'java.targetCompatibility = JavaVersion.VERSION_17');
    content = content.replace(/jvmTarget\s*=\s*"21"/g, 'jvmTarget = "17"');
    content = content.replace(/jvmTarget\s*=\s*21/g, 'jvmTarget = 17');
    
    fs.writeFileSync(capacitorBuildPath, content);
    console.log('✅ Fixed capacitor.build.gradle');
  }
}

// Function to update variables.gradle if it exists
function fixVariablesGradle() {
  const variablesPath = path.join('android', 'variables.gradle');
  
  if (fs.existsSync(variablesPath)) {
    let content = fs.readFileSync(variablesPath, 'utf8');
    
    // Force compile SDK and build tools
    content = content.replace(/compileSdkVersion\s*=\s*\d+/g, 'compileSdkVersion = 35');
    content = content.replace(/targetSdkVersion\s*=\s*\d+/g, 'targetSdkVersion = 35');
    content = content.replace(/buildToolsVersion\s*=\s*["']\d+\.\d+\.\d+["']/g, 'buildToolsVersion = "35.0.0"');
    
    fs.writeFileSync(variablesPath, content);
    console.log('✅ Fixed variables.gradle');
  }
}

// Main execution
try {
  fixBuildGradle();
  fixCapacitorBuildGradle();
  fixVariablesGradle();
  console.log('🎉 Android Java version fix completed!');
} catch (error) {
  console.error('❌ Error fixing Android Java version:', error);
  process.exit(1);
}