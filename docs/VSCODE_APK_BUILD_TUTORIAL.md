# 🚀 VS Code দিয়ে AgriShokti AI APK বিল্ড করার সম্পূর্ণ টিউটোরিয়াল

এই গাইড আপনাকে **Android Studio ছাড়াই** শুধুমাত্র **VS Code এবং Terminal** ব্যবহার করে APK বানাতে সাহায্য করবে।

---

## 📋 সূচিপত্র

1. [প্রয়োজনীয় সফটওয়্যার](#-প্রয়োজনীয়-সফটওয়্যার)
2. [Windows সেটআপ](#-windows-সেটআপ)
3. [macOS সেটআপ](#-macos-সেটআপ)
4. [Linux সেটআপ](#-linux-সেটআপ)
5. [প্রজেক্ট সেটআপ](#-প্রজেক্ট-সেটআপ)
6. [APK বিল্ড করুন](#-apk-বিল্ড-করুন)
7. [Play Store AAB বিল্ড](#-play-store-aab-বিল্ড)
8. [সমস্যা সমাধান](#-সমস্যা-সমাধান)

---

## 📦 প্রয়োজনীয় সফটওয়্যার

| সফটওয়্যার | ভার্সন | ডাউনলোড লিংক |
|-----------|--------|--------------|
| Node.js | v18+ | https://nodejs.org/ |
| VS Code | Latest | https://code.visualstudio.com/ |
| Java JDK | 17 | https://adoptium.net/ |
| Android Command Line Tools | Latest | https://developer.android.com/studio#command-line-tools-only |
| Git | Latest | https://git-scm.com/ |

---

## 🪟 Windows সেটআপ

### ধাপ ১: Java JDK 17 ইনস্টল করুন

1. https://adoptium.net/ থেকে **Temurin 17 (LTS)** ডাউনলোড করুন
2. ইনস্টলার চালান
3. ইনস্টলেশনের সময় "Set JAVA_HOME variable" চেক করুন

**ভেরিফাই করুন:**
```powershell
java -version
# Output: openjdk version "17.x.x"
```

### ধাপ ২: Android Command Line Tools ইনস্টল করুন

1. https://developer.android.com/studio#command-line-tools-only থেকে ডাউনলোড করুন
2. একটি ফোল্ডার তৈরি করুন: `C:\Android\cmdline-tools`
3. ডাউনলোড করা ZIP এক্সট্রাক্ট করুন
4. এক্সট্রাক্ট করা ফোল্ডারটির নাম `latest` রাখুন
5. ফাইনাল path হবে: `C:\Android\cmdline-tools\latest\bin\`

### ধাপ ৩: Environment Variables সেট করুন

**PowerShell (Administrator) খুলুন এবং রান করুন:**

```powershell
# ANDROID_HOME সেট করুন
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Android", "User")

# Path এ যোগ করুন
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
$newPath = "$currentPath;C:\Android\cmdline-tools\latest\bin;C:\Android\platform-tools"
[Environment]::SetEnvironmentVariable("Path", $newPath, "User")
```

**টার্মিনাল বন্ধ করে আবার খুলুন।**

### ধাপ ৪: Android SDK ইনস্টল করুন

```powershell
# SDK Manager দিয়ে প্রয়োজনীয় packages ইনস্টল করুন
sdkmanager --sdk_root=C:\Android "platform-tools"
sdkmanager --sdk_root=C:\Android "platforms;android-34"
sdkmanager --sdk_root=C:\Android "build-tools;34.0.0"

# License accept করুন
sdkmanager --sdk_root=C:\Android --licenses
# সব প্রশ্নে 'y' টাইপ করুন
```

**ভেরিফাই করুন:**
```powershell
sdkmanager --version
adb --version
```

---

## 🍎 macOS সেটআপ

### ধাপ ১: Homebrew দিয়ে ইনস্টল করুন

```bash
# Homebrew ইনস্টল করুন (যদি না থাকে)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Java 17 ইনস্টল করুন
brew install openjdk@17

# Java PATH সেট করুন
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### ধাপ ২: Android Command Line Tools ইনস্টল করুন

```bash
# Android ফোল্ডার তৈরি করুন
mkdir -p ~/Library/Android/sdk/cmdline-tools

# Command line tools ডাউনলোড করুন
cd ~/Downloads
curl -O https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip

# Extract এবং move করুন
unzip commandlinetools-mac-*.zip
mv cmdline-tools ~/Library/Android/sdk/cmdline-tools/latest
```

### ধাপ ৩: Environment Variables সেট করুন

```bash
# ~/.zshrc ফাইলে যোগ করুন
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc

# Apply করুন
source ~/.zshrc
```

### ধাপ ৪: Android SDK ইনস্টল করুন

```bash
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
sdkmanager --licenses
```

---

## 🐧 Linux সেটআপ

### ধাপ ১: Java এবং প্রয়োজনীয় packages

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-17-jdk unzip wget

# ভেরিফাই করুন
java -version
```

### ধাপ ২: Android Command Line Tools

```bash
# ফোল্ডার তৈরি করুন
mkdir -p ~/Android/cmdline-tools

# ডাউনলোড করুন
cd ~/Downloads
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip

# Extract করুন
unzip commandlinetools-linux-*.zip
mv cmdline-tools ~/Android/cmdline-tools/latest
```

### ধাপ ৩: Environment Variables

```bash
# ~/.bashrc এ যোগ করুন
echo 'export ANDROID_HOME=$HOME/Android' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc

source ~/.bashrc
```

### ধাপ ৪: SDK ইনস্টল করুন

```bash
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
sdkmanager --licenses
```

---

## 📁 প্রজেক্ট সেটআপ

### ধাপ ১: GitHub থেকে প্রজেক্ট ক্লোন করুন

```bash
# আপনার প্রজেক্ট ক্লোন করুন
git clone https://github.com/YOUR_USERNAME/agri-shokti-bangla.git
cd agri-shokti-bangla

# VS Code এ খুলুন
code .
```

### ধাপ ২: Dependencies ইনস্টল করুন

VS Code তে Terminal খুলুন (Ctrl+` বা Cmd+`):

```bash
# Node dependencies ইনস্টল করুন
npm install

# Capacitor CLI globally ইনস্টল করুন (ঐচ্ছিক কিন্তু সুবিধাজনক)
npm install -g @capacitor/cli
```

### ধাপ ৩: Web অ্যাপ বিল্ড করুন

```bash
# Production build তৈরি করুন
npm run build
```

**সফল হলে দেখবেন:**
```
✓ built in X.XXs
dist/
  ├── index.html
  ├── assets/
  └── ...
```

### ধাপ ৪: Android প্ল্যাটফর্ম যোগ করুন

```bash
# Android প্ল্যাটফর্ম যোগ করুন (প্রথমবার)
npx cap add android

# Web assets sync করুন
npx cap sync android
```

**⚠️ নোট:** যদি android ফোল্ডার আগে থেকে থাকে:
```bash
# শুধু sync করুন
npx cap sync android
```

---

## 📱 APK বিল্ড করুন

### Debug APK (টেস্টিং এর জন্য)

```bash
# Android ফোল্ডারে যান
cd android

# Windows এ:
gradlew.bat assembleDebug

# macOS/Linux এ:
./gradlew assembleDebug
```

**বিল্ড শেষ হলে APK পাবেন:**
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### APK সাইজ দেখুন

```bash
# Windows
dir app\build\outputs\apk\debug\app-debug.apk

# macOS/Linux
ls -lh app/build/outputs/apk/debug/app-debug.apk
```

---

## 📲 APK ইনস্টল করুন

### USB দিয়ে ফোনে ইনস্টল

1. **Developer Options চালু করুন:**
   - Settings → About Phone → Build Number (7 বার ট্যাপ করুন)
   
2. **USB Debugging চালু করুন:**
   - Settings → Developer Options → USB Debugging → ON

3. **ফোন কানেক্ট করুন এবং ইনস্টল করুন:**

```bash
# ফোন কানেক্টেড আছে কিনা চেক করুন
adb devices

# APK ইনস্টল করুন
adb install app/build/outputs/apk/debug/app-debug.apk
```

### ইমুলেটর ছাড়া টেস্ট

APK ফাইল সরাসরি ফোনে কপি করে ইনস্টল করতে পারবেন:
1. APK ফাইল Google Drive/WhatsApp এ পাঠান
2. ফোন থেকে ডাউনলোড করুন
3. "Install from Unknown Sources" enable করুন
4. ইনস্টল করুন

---

## 🏪 Play Store AAB বিল্ড

### ধাপ ১: Signing Key তৈরি করুন

```bash
# প্রজেক্ট রুটে যান
cd ..

# Keystore তৈরি করুন
keytool -genkey -v -keystore agrishokti-release.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias agrishokti

# প্রম্পটে দিন:
# - Keystore password (মনে রাখুন!)
# - আপনার নাম
# - Organization
# - City, State, Country
# - Key password (same as keystore password রাখুন)
```

**⚠️ গুরুত্বপূর্ণ:** 
- এই keystore ফাইল হারাবেন না!
- Password মনে রাখুন!
- এটি ছাড়া Play Store এ আপডেট দিতে পারবেন না!

### ধাপ ২: Keystore কে android ফোল্ডারে কপি করুন

```bash
# Windows
copy agrishokti-release.keystore android\app\

# macOS/Linux
cp agrishokti-release.keystore android/app/
```

### ধাপ ৩: Signing কনফিগারেশন

`android/app/build.gradle` ফাইল এডিট করুন:

```groovy
android {
    ...
    signingConfigs {
        release {
            storeFile file('agrishokti-release.keystore')
            storePassword 'YOUR_KEYSTORE_PASSWORD'
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

### ধাপ ৪: Release AAB বিল্ড করুন

```bash
cd android

# Windows
gradlew.bat bundleRelease

# macOS/Linux
./gradlew bundleRelease
```

**AAB ফাইল পাবেন:**
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🎯 VS Code সুবিধাজনক সেটআপ

### tasks.json তৈরি করুন

`.vscode/tasks.json` ফাইল তৈরি করুন:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Build Web",
      "type": "shell",
      "command": "npm run build",
      "group": "build"
    },
    {
      "label": "Sync Android",
      "type": "shell",
      "command": "npx cap sync android",
      "group": "build"
    },
    {
      "label": "Build Debug APK",
      "type": "shell",
      "command": "cd android && ./gradlew assembleDebug",
      "group": "build",
      "windows": {
        "command": "cd android && gradlew.bat assembleDebug"
      }
    },
    {
      "label": "Build Release AAB",
      "type": "shell", 
      "command": "cd android && ./gradlew bundleRelease",
      "group": "build",
      "windows": {
        "command": "cd android && gradlew.bat bundleRelease"
      }
    },
    {
      "label": "Full Android Build",
      "type": "shell",
      "command": "npm run build && npx cap sync android && cd android && ./gradlew assembleDebug",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "windows": {
        "command": "npm run build && npx cap sync android && cd android && gradlew.bat assembleDebug"
      }
    }
  ]
}
```

**ব্যবহার:**
- `Ctrl+Shift+B` (Windows/Linux) বা `Cmd+Shift+B` (Mac)
- অথবা Command Palette → "Tasks: Run Task"

---

## 🛠️ সমস্যা সমাধান

### সমস্যা ১: `ANDROID_HOME` not found

```bash
# চেক করুন
echo $ANDROID_HOME  # macOS/Linux
echo %ANDROID_HOME% # Windows CMD
$env:ANDROID_HOME   # Windows PowerShell

# যদি খালি থাকে, আবার সেট করুন এবং টার্মিনাল রিস্টার্ট করুন
```

### সমস্যা ২: SDK licenses not accepted

```bash
sdkmanager --licenses
# সব প্রশ্নে 'y' দিন
```

### সমস্যা ৩: Gradle build failed

```bash
cd android

# Clean করুন
./gradlew clean  # macOS/Linux
gradlew.bat clean  # Windows

# আবার বিল্ড করুন
./gradlew assembleDebug
```

### সমস্যা ৪: Java version mismatch

```bash
# Java version চেক করুন
java -version

# JDK 17 হতে হবে। অন্য version থাকলে:
# - JAVA_HOME সঠিক path এ সেট করুন
```

### সমস্যা ৫: `npx cap sync` error

```bash
# Web build আছে কিনা চেক করুন
ls dist/  # macOS/Linux
dir dist  # Windows

# না থাকলে আগে build করুন
npm run build
```

---

## 📊 Quick Reference Commands

| কাজ | কমান্ড |
|-----|--------|
| Web Build | `npm run build` |
| Sync Android | `npx cap sync android` |
| Debug APK | `cd android && ./gradlew assembleDebug` |
| Release AAB | `cd android && ./gradlew bundleRelease` |
| Install APK | `adb install android/app/build/outputs/apk/debug/app-debug.apk` |
| Clean Build | `cd android && ./gradlew clean` |
| Check Devices | `adb devices` |

---

## ✅ সফল বিল্ড চেকলিস্ট

- [ ] Java 17 ইনস্টল করা
- [ ] ANDROID_HOME সেট করা
- [ ] Android SDK tools ইনস্টল করা
- [ ] `npm install` সম্পন্ন
- [ ] `npm run build` সফল
- [ ] `npx cap sync android` সফল
- [ ] Debug APK বিল্ড হয়েছে
- [ ] APK ফোনে টেস্ট করা হয়েছে

---

## 📞 সাপোর্ট

সমস্যা হলে:
1. এই গাইডের Troubleshooting সেকশন দেখুন
2. GitHub Issues এ রিপোর্ট করুন
3. Capacitor Docs: https://capacitorjs.com/docs

---

**তৈরি করেছে:** AgriShokti AI Team  
**সর্বশেষ আপডেট:** January 2025  
**Capacitor Version:** 6.x
