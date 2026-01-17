# 🌾 AgriShokti AI - Android Build Guide

## সম্পূর্ণ Android APK/AAB বিল্ড নির্দেশিকা

এই গাইড আপনাকে AgriShokti AI ওয়েব অ্যাপকে একটি সম্পূর্ণ কার্যকরী Android অ্যাপে রূপান্তর করতে সাহায্য করবে।

---

## 📋 প্রয়োজনীয়তা (Prerequisites)

### সফটওয়্যার ইনস্টল করুন:

1. **Node.js** (v18+): https://nodejs.org/
2. **VS Code**: https://code.visualstudio.com/ (প্রস্তাবিত)
3. **Android Studio** অথবা **Android SDK Command Line Tools**: 
   - Android Studio: https://developer.android.com/studio
   - শুধু SDK চাইলে: https://developer.android.com/studio#command-line-tools-only
4. **Java JDK 17**: https://adoptium.net/
5. **Git**: https://git-scm.com/

### VS Code Extensions (প্রস্তাবিত):
1. **Ionic** - Capacitor প্রজেক্ট ম্যানেজমেন্ট
2. **Android iOS Emulator** - এমুলেটর চালানোর জন্য
3. **ESLint** - কোড কোয়ালিটি
4. **Prettier** - কোড ফরম্যাটিং

### Android SDK সেটআপ (VS Code দিয়ে):

**Windows:**
```bash
# Environment variables সেট করুন
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin"
```

**macOS/Linux:**
```bash
# ~/.bashrc বা ~/.zshrc ফাইলে যোগ করুন
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin
```

**SDK Components ইনস্টল করুন:**
```bash
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

---

## 🚀 ধাপে ধাপে বিল্ড প্রক্রিয়া

### ধাপ ১: প্রজেক্ট ক্লোন করুন

```bash
# GitHub থেকে প্রজেক্ট ক্লোন করুন
git clone https://github.com/YOUR_USERNAME/agri-shokti-bangla.git
cd agri-shokti-bangla

# Dependencies ইনস্টল করুন
npm install
```

### ধাপ ২: প্রোডাকশন বিল্ড তৈরি করুন

```bash
# Web অ্যাপ বিল্ড করুন
npm run build
```

### ধাপ ৩: Android প্ল্যাটফর্ম যোগ করুন

```bash
# Android প্ল্যাটফর্ম যোগ করুন
npx cap add android

# Native dependencies আপডেট করুন
npx cap update android

# Web assets sync করুন
npx cap sync android
```

### ধাপ ৪: VS Code তে বিল্ড করুন

**Terminal ব্যবহার করে (VS Code Integrated Terminal):**
```bash
# Android ফোল্ডারে যান
cd android

# Debug APK বিল্ড করুন
./gradlew assembleDebug

# APK লোকেশন: android/app/build/outputs/apk/debug/app-debug.apk
```

**অথবা Android Studio তে খুলতে পারেন:**
```bash
# Android Studio তে প্রজেক্ট খুলুন (ঐচ্ছিক)
npx cap open android
```

---

## 🔧 Android Studio কনফিগারেশন

### App Icon পরিবর্তন করুন:
1. Android Studio তে: `app > res` ফোল্ডারে রাইট ক্লিক
2. `New > Image Asset` সিলেক্ট করুন
3. আপনার icon ইমেজ আপলোড করুন (1024x1024 PNG recommended)
4. Foreground এবং Background layer কনফিগার করুন

### Splash Screen কাস্টমাইজ করুন:
1. `android/app/src/main/res/drawable/splash.xml` এডিট করুন
2. আপনার splash image যোগ করুন `res/drawable/` ফোল্ডারে

---

## 📱 APK বিল্ড করুন (ডেভেলপমেন্ট টেস্টিং)

### Debug APK:
```bash
cd android

# Debug APK বিল্ড করুন
./gradlew assembleDebug

# APK লোকেশন: android/app/build/outputs/apk/debug/app-debug.apk
```

### APK ইনস্টল করুন (Connected Device):
```bash
# USB দিয়ে ফোন কানেক্ট করুন (USB Debugging ON থাকতে হবে)
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 🏪 Play Store এর জন্য AAB বিল্ড করুন

### ধাপ ১: Signing Key তৈরি করুন

```bash
# Keystore তৈরি করুন (একবার করলেই হবে, হারাবেন না!)
keytool -genkey -v -keystore agrishokti-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias agrishokti

# এই তথ্যগুলো নিরাপদে রাখুন:
# - Keystore password
# - Key alias (agrishokti)
# - Key password
```

### ধাপ ২: Signing কনফিগারেশন

`android/app/build.gradle` ফাইলে যোগ করুন:

```groovy
android {
    ...
    signingConfigs {
        release {
            storeFile file('agrishokti-release-key.jks')
            storePassword 'YOUR_STORE_PASSWORD'
            keyAlias 'agrishokti'
            keyPassword 'YOUR_KEY_PASSWORD'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### ধাপ ৩: Release AAB বিল্ড করুন

```bash
cd android

# Release AAB বিল্ড করুন
./gradlew bundleRelease

# AAB লোকেশন: android/app/build/outputs/bundle/release/app-release.aab
```

---

## 📋 Play Store Upload Checklist

### ✅ App Information:
- [ ] App name: "AgriShokti AI - কৃষি সহায়ক"
- [ ] Short description (80 chars): "AI-powered agricultural assistant for Bangladeshi farmers"
- [ ] Full description (4000 chars): বিস্তারিত বর্ণনা
- [ ] Category: Tools or Education
- [ ] Content rating: Everyone

### ✅ Graphics Assets:
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Screenshots:
  - Phone: 2-8 screenshots (min 320px, max 3840px)
  - Tablet: 2-8 screenshots (7" and 10")

### ✅ Store Listing:
- [ ] Privacy Policy URL (required)
- [ ] Contact email
- [ ] Default language: Bengali (bn-BD)

### ✅ App Content:
- [ ] Target audience: 13+ years
- [ ] Ads declaration: No ads OR ad disclosure
- [ ] Data safety form completed

### ✅ Technical Requirements:
- [ ] targetSdkVersion: 34 (Android 14)
- [ ] AAB format (not APK)
- [ ] Signed with release key
- [ ] App size under 150MB

---

## 🔐 Privacy Policy Template

আপনার Privacy Policy URL এ এই তথ্যগুলো থাকতে হবে:

### Data Collection:
1. **Camera Access**: ফসলের ছবি তোলার জন্য
2. **Location Data**: আবহাওয়া ও স্যাটেলাইট ডেটার জন্য
3. **Storage Access**: ছবি সেভ করার জন্য
4. **Internet Access**: AI analysis এবং data sync এর জন্য

### Data Usage:
- ফসলের রোগ শনাক্তকরণ
- আবহাওয়ার পূর্বাভাস
- NDVI satellite monitoring
- কৃষি পরামর্শ

### Data Storage:
- User data Supabase (secure cloud) এ সংরক্ষিত
- Images temporarily processed, not permanently stored
- No data sold to third parties

---

## 🐛 সাধারণ সমস্যা ও সমাধান

### সমস্যা ১: Gradle Build Failed
```bash
# Clean build
cd android
./gradlew clean
./gradlew assembleDebug
```

### সমস্যা ২: SDK Not Found
```bash
# local.properties ফাইলে SDK path যোগ করুন
echo "sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk" > android/local.properties
```

### সমস্যা ৩: Camera Not Working
- AndroidManifest.xml এ permissions আছে কিনা চেক করুন
- Runtime permissions handle করা আছে কিনা দেখুন

### সমস্যা ৪: White Screen on Launch
```bash
# Capacitor sync করুন
npm run build
npx cap sync android
```

---

## 📞 সাপোর্ট

সমস্যা হলে:
1. GitHub Issues এ রিপোর্ট করুন
2. Lovable documentation দেখুন: https://docs.lovable.dev

---

## 🔗 গুরুত্বপূর্ণ লিংক

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Play Console](https://play.google.com/console)
- [Lovable Blog - Native Mobile Apps](https://lovable.dev/blog/native-mobile-app)

---

**তৈরি করেছে:** AgriShokti AI Team
**সর্বশেষ আপডেট:** January 2025
