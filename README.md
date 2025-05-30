# 📞 React Native Audio Call App using ZEGOCLOUD & FCM

A real-time audio call application built using React Native, ZEGOCLOUD, and Firebase. Supports offline call invitations even when the app is killed or the device is asleep using FCM notifications and Firebase Realtime Database.

## ⚙️ Installation & Setup

### 🔧 Prerequisites
- Node.js >= 14.x
- React Native CLI
- Android Studio / Xcode (for building apps)
- Firebase Project with FCM & Realtime Database enabled
- ZEGOCLOUD account with AppID and AppSign

### 📁 Clone the Repository
```bash
git clone https://github.com/your-username/audio-call-app.git
cd audio-call-app
```

### 📦 Install Dependencies
```bash
npm install
```

### 🔑 Firebase Setup
1. Go to the Firebase Console and create a new project.
2. Enable Realtime Database:
   - Go to Build > Realtime Database.
   - Click Create Database and set rules as required.
3. Enable Cloud Messaging:
   - Go to Build > Cloud Messaging.
   - Save the Server Key and Sender ID (used in backend or ZEGOCLOUD if needed).
4. Download the ```google-services.json``` file:
   - Go to Project Settings > General.
   - In Your apps, choose Android or add a new Android app.
   - Download the ```google-services.json```.
5. Place ```google-services.json``` into:
```bash
android/app/google-services.json
```

### 🔊 ZEGOCLOUD Setup
1. Sign up at ZEGOCLOUD Console.
2. Create a new project and choose Voice Call.
3. Copy the AppID and AppSign from the dashboard.
4. Set these in your codebase (```config.js``` or ```.env```):
```bash
export const ZEGOCLOUD_APP_ID = YOUR_APP_ID;
export const ZEGOCLOUD_APP_SIGN = 'YOUR_APP_SIGN';
```
5. Configure ZEGOCLOUD Cloud Functions (if needed) for Firebase integration to send push notifications when offline.

### 🛠️ Android Setup
1. Navigate to the android folder and clean build cache:
```bash
cd android
./gradlew clean
cd ..
```
2. Run the app on Android:
```bash
npx react-native run-android
```
3. For generating the release APK:
```bash
cd android
./gradlew assembleRelease
```
The APK will be available in:
```bash
android/app/build/outputs/apk/release/app-release.apk
```
