#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Simple Java 17 fix for existing files...');

// Function to safely replace Java versions in any file
function fixJavaVersionInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Replace Java 21 with Java 17
    if (content.includes('JavaVersion.VERSION_21')) {
      content = content.replace(/JavaVersion\.VERSION_21/g, 'JavaVersion.VERSION_17');
      changed = true;
    }
    
    // Replace JVM target
    if (content.includes('jvmTarget = "21"') || content.includes('jvmTarget = 21')) {
      content = content.replace(/jvmTarget\s*=\s*"21"/g, 'jvmTarget = "17"');
      content = content.replace(/jvmTarget\s*=\s*21/g, 'jvmTarget = 17');
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed ${path.basename(filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Find and fix all gradle files
function findAndFixGradleFiles() {
  const androidPath = path.join('android');
  
  if (!fs.existsSync(androidPath)) {
    console.log('❌ Android directory not found');
    return;
  }
  
  // Recursively find all .gradle files
  function findGradleFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...findGradleFiles(fullPath));
      } else if (item.endsWith('.gradle')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  const gradleFiles = findGradleFiles(androidPath);
  console.log(`Found ${gradleFiles.length} Gradle files`);
  
  let fixedCount = 0;
  for (const file of gradleFiles) {
    if (fixJavaVersionInFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`🎉 Fixed ${fixedCount} files`);
}

// Main execution
try {
  findAndFixGradleFiles();
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}