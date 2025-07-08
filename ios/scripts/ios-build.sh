#!/bin/bash

# iOS Build Script with Automatic Provisioning
# This script ensures the iOS build always works with proper provisioning

echo "🔨 Building iOS app with automatic provisioning..."

# Navigate to project root
cd "$(dirname "$0")/.."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf ios/build
rm -rf /Users/jonhnefilljakobsson/Library/Developer/Xcode/DerivedData/HostAway-*

# Build and run with provisioning updates
echo "🚀 Building and launching app..."
cd ios
xcodebuild -workspace HostAway.xcworkspace \
           -configuration Debug \
           -scheme HostAway \
           -destination 'platform=iOS Simulator,name=iPhone 16 Pro' \
           -allowProvisioningUpdates \
           build

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Installing app..."
    # Install the app
    xcrun simctl install booted "/Users/jonhnefilljakobsson/Library/Developer/Xcode/DerivedData/HostAway-"*/Build/Products/Debug-iphonesimulator/HostAway.app
    
    # Launch the app
    xcrun simctl launch booted org.reactjs.native.example.HostAway
    
    echo "🎉 App launched successfully!"
else
    echo "❌ Build failed!"
    exit 1
fi
