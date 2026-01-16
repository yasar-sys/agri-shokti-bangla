import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.agrishokti.ai',
  appName: 'AgriShokti AI',
  webDir: 'dist',
  server: {
    // For development: Use live URL for hot-reload
    // url: 'https://1b5b77c9-0479-4e90-a788-89ecd3938c2c.lovableproject.com?forceHideBadge=true',
    // For production: Comment out the url to use local dist folder
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1a472a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#4ade80',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1a472a'
    },
    Camera: {
      presentationStyle: 'fullscreen'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false // Set to true for debugging
  }
};

export default config;
