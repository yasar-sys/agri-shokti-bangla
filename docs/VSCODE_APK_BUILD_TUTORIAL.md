# 🚀 AgriShokti AI - Play Store Release Build Guide

VS Code ব্যবহার করে Android AAB/APK বিল্ড করার গাইড।

---

## 📦 প্রয়োজনীয় সফটওয়্যার

| সফটওয়্যার | ভার্সন | ডাউনলোড |
|-----------|--------|---------|
| Node.js | 18+ | https://nodejs.org |
| Java JDK | 17 | https://adoptium.net |
| Android SDK | 34 | [Command Line Tools](https://developer.android.com/studio#command-line-tools-only) |

---

## 🔧 Environment Setup

### Windows
```powershell
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Android", "User")
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17", "User")
```

### macOS/Linux
```bash
echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.zshrc
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc
source ~/.zshrc
```

### SDK Install
```bash
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
sdkmanager --licenses
```

---

## 🏗️ Build Steps

### Step 1: Web Build
```bash
npm install
npm run build
```

### Step 2: Android Sync
```bash
npx cap sync android
```

---

## 🔐 Signing Key তৈরি (একবারই)

```bash
cd android/app
keytool -genkey -v -keystore agrishokti-release.keystore -alias agrishokti -keyalg RSA -keysize 2048 -validity 10000
```

⚠️ **Password ও keystore ফাইল নিরাপদে রাখুন!**

---

## ⚙️ Signing Config

`android/app/build.gradle` এ আপডেট করুন:

```gradle
signingConfigs {
    release {
        storeFile file('agrishokti-release.keystore')
        storePassword 'YOUR_PASSWORD'
        keyAlias 'agrishokti'
        keyPassword 'YOUR_PASSWORD'
    }
}

buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        signingConfig signingConfigs.release
    }
}
```

---

## 📦 Release AAB (Play Store)

```bash
cd android
./gradlew bundleRelease
```

**Output:** `android/app/build/outputs/bundle/release/app-release.aab`

---

## 📲 Release APK (Direct Install)

```bash
cd android
./gradlew assembleRelease
```

**Output:** `android/app/build/outputs/apk/release/app-release.apk`

---

## ✅ Quick Commands

```bash
# Full Release Build
npm run build && npx cap sync android && cd android && ./gradlew bundleRelease

# Debug Build
npm run build && npx cap sync android && cd android && ./gradlew assembleDebug
```

---

## 🛠️ Troubleshooting

| সমস্যা | সমাধান |
|--------|--------|
| Build Failed | `cd android && ./gradlew clean` |
| SDK Not Found | `echo "sdk.dir=$ANDROID_HOME" > android/local.properties` |
| Java Error | JDK 17 ইনস্টল করুন |

---

## 📋 Play Store Checklist

- [ ] App Icon: 512x512 PNG
- [ ] Feature Graphic: 1024x500 PNG  
- [ ] Screenshots: 2+ phone
- [ ] Privacy Policy URL
- [ ] AAB ফাইল আপলোড
