#!/bin/bash

echo "🔧 Running Capacitor sync with Java 17 fix..."

# Run the standard capacitor sync
npx cap sync

# Apply our Java 17 fixes
node scripts/fix-android-java.cjs

echo "✅ Capacitor sync completed with Java 17 enforced!"