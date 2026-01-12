# Capacitor Setup Guide for Sudogu Game

This guide will help you convert your web game into iOS and Android apps using Capacitor.

## Prerequisites

### 1. Install Node.js and npm
Download and install Node.js from: https://nodejs.org/
- Choose the LTS (Long Term Support) version
- This will also install npm (Node Package Manager)

After installation, verify by opening Terminal and running:
```bash
node --version
npm --version
```

### 2. Install Xcode (for iOS)
- Download Xcode from the Mac App Store
- Open Xcode after installation to accept the license agreement
- Install Command Line Tools:
  ```bash
  xcode-select --install
  ```

### 3. Install Android Studio (for Android)
- Download from: https://developer.android.com/studio
- Install Android SDK and required tools through Android Studio
- Set up environment variables (Android Studio will guide you)

---

## Step-by-Step Capacitor Setup

Once Node.js is installed, run these commands in your project directory:

### Step 1: Initialize npm Project
```bash
cd /Users/dilara/Desktop/kod
npm init -y
```

### Step 2: Install Capacitor
```bash
npm install @capacitor/core @capacitor/cli
```

### Step 3: Initialize Capacitor
```bash
npx cap init
```

You'll be asked:
- **App name**: `Sudogu` (or your preferred name)
- **App ID**: `com.sudogu.app` (reverse domain format)
- **Web asset directory**: `.` (current directory, since all files are in root)

### Step 4: Install iOS Platform
```bash
npm install @capacitor/ios
npx cap add ios
```

### Step 5: Install Android Platform
```bash
npm install @capacitor/android
npx cap add android
```

### Step 6: Configure capacitor.config.json
The file will be auto-generated. Update it if needed:

```json
{
  "appId": "com.sudogu.app",
  "appName": "Sudogu",
  "webDir": ".",
  "server": {
    "androidScheme": "https"
  }
}
```

### Step 7: Copy Web Assets to Native Projects
```bash
npx cap sync
```

---

## Building for iOS

### Open Xcode:
```bash
npx cap open ios
```

In Xcode:
1. Select your Development Team (Apple Developer Account required)
2. Choose a simulator or real device
3. Click the Play button to build and run

### For App Store Submission:
1. Archive the app: `Product > Archive`
2. Distribute to App Store
3. You'll need:
   - Apple Developer Account ($99/year)
   - App icons (various sizes)
   - Screenshots
   - App Store listing information

---

## Building for Android

### Open Android Studio:
```bash
npx cap open android
```

In Android Studio:
1. Wait for Gradle sync to complete
2. Select a device/emulator
3. Click the Run button (green play icon)

### For Google Play Submission:
1. Generate a signed APK/Bundle: `Build > Generate Signed Bundle/APK`
2. You'll need:
   - Google Play Developer Account ($25 one-time fee)
   - App icons and feature graphic
   - Screenshots
   - Store listing information

---

## App Icons and Splash Screens

### Icon Requirements:
- **iOS**: 1024x1024px PNG (App Store)
- **Android**: 512x512px PNG (Google Play)

### Generate Icons for All Sizes:
Use a tool like https://icon.kitchen/ or:

```bash
npm install -g cordova-res
cordova-res ios --skip-config --copy
cordova-res android --skip-config --copy
```

Place your icon file in the project root as:
- `icon.png` (1024x1024px)
- `splash.png` (2732x2732px for splash screen)

---

## Important Configuration Files

### 1. capacitor.config.json
Main Capacitor configuration

### 2. package.json
Lists all dependencies

### 3. ios/App/App/Info.plist
iOS app configuration (permissions, etc.)

### 4. android/app/src/main/AndroidManifest.xml
Android app configuration (permissions, etc.)

---

## Adding App Permissions

If your game needs specific permissions (like notifications), add them:

### iOS (Info.plist):
```xml
<key>NSUserTrackingUsageDescription</key>
<string>We use tracking to improve your experience</string>
```

### Android (AndroidManifest.xml):
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

---

## Testing on Real Devices

### iOS:
1. Connect your iPhone via USB
2. Trust the computer on your iPhone
3. Select your device in Xcode
4. Click Run

### Android:
1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect via USB
4. Select your device in Android Studio
5. Click Run

---

## Updating the App

After making changes to your web files:

```bash
npx cap sync
```

This copies the updated files to both platforms.

Then rebuild in Xcode or Android Studio.

---

## Common Issues & Solutions

### Issue: "Command not found: npx"
**Solution**: Restart Terminal after installing Node.js

### Issue: Xcode build fails
**Solution**:
- Clean build folder: `Product > Clean Build Folder`
- Update CocoaPods: `cd ios/App && pod install`

### Issue: Android Gradle errors
**Solution**:
- Update Gradle: `./gradlew --version`
- Sync project: `File > Sync Project with Gradle Files`

### Issue: White screen on app launch
**Solution**: Check browser console in Xcode/Android Studio for errors

---

## Next Steps

1. Install Node.js
2. Run the setup commands above
3. Configure app icons
4. Test on simulators
5. Test on real devices
6. Prepare store listings
7. Submit to App Store and Google Play!

---

## Useful Resources

- Capacitor Docs: https://capacitorjs.com/docs
- iOS Human Interface Guidelines: https://developer.apple.com/design/
- Android Material Design: https://material.io/design
- App Store Connect: https://appstoreconnect.apple.com/
- Google Play Console: https://play.google.com/console/

---

## App Store Requirements

### iOS App Store:
- Apple Developer Account ($99/year)
- Privacy Policy URL
- App icons (all required sizes)
- Screenshots (various device sizes)
- App description and keywords
- Age rating

### Google Play Store:
- Google Play Developer Account ($25 one-time)
- Privacy Policy URL
- App icons and feature graphic
- Screenshots (phone + tablet)
- App description
- Content rating questionnaire

---

Good luck with your app submission! 🎉
