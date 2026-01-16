/**
 * Capacitor Native Plugins for AgriShokti AI
 * This file provides wrapper functions for native device capabilities
 */

import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Network } from '@capacitor/network';
import { Geolocation } from '@capacitor/geolocation';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';

// Check if running on native platform
export const isNativePlatform = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();

/**
 * Camera Functions
 */
export const takePicture = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      correctOrientation: true,
    });
    return image;
  } catch (error) {
    console.error('Camera error:', error);
    throw error;
  }
};

export const pickImage = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
      correctOrientation: true,
    });
    return image;
  } catch (error) {
    console.error('Image picker error:', error);
    throw error;
  }
};

export const checkCameraPermissions = async () => {
  try {
    const permissions = await Camera.checkPermissions();
    return permissions;
  } catch (error) {
    console.error('Camera permission check error:', error);
    return null;
  }
};

export const requestCameraPermissions = async () => {
  try {
    const permissions = await Camera.requestPermissions();
    return permissions;
  } catch (error) {
    console.error('Camera permission request error:', error);
    return null;
  }
};

/**
 * Network Functions
 */
export const getNetworkStatus = async () => {
  try {
    const status = await Network.getStatus();
    return status;
  } catch (error) {
    console.error('Network status error:', error);
    return { connected: true, connectionType: 'unknown' };
  }
};

export const addNetworkListener = (callback: (status: { connected: boolean; connectionType: string }) => void) => {
  return Network.addListener('networkStatusChange', callback);
};

/**
 * Geolocation Functions
 */
export const getCurrentPosition = async () => {
  try {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });
    return position;
  } catch (error) {
    console.error('Geolocation error:', error);
    throw error;
  }
};

export const checkLocationPermissions = async () => {
  try {
    const permissions = await Geolocation.checkPermissions();
    return permissions;
  } catch (error) {
    console.error('Location permission check error:', error);
    return null;
  }
};

export const requestLocationPermissions = async () => {
  try {
    const permissions = await Geolocation.requestPermissions();
    return permissions;
  } catch (error) {
    console.error('Location permission request error:', error);
    return null;
  }
};

/**
 * Filesystem Functions
 */
export const saveFile = async (data: string, fileName: string) => {
  try {
    const result = await Filesystem.writeFile({
      path: fileName,
      data: data,
      directory: Directory.Documents,
    });
    return result;
  } catch (error) {
    console.error('File save error:', error);
    throw error;
  }
};

export const readFile = async (fileName: string) => {
  try {
    const result = await Filesystem.readFile({
      path: fileName,
      directory: Directory.Documents,
    });
    return result;
  } catch (error) {
    console.error('File read error:', error);
    throw error;
  }
};

/**
 * Splash Screen Functions
 */
export const hideSplashScreen = async () => {
  try {
    await SplashScreen.hide();
  } catch (error) {
    console.error('Splash screen hide error:', error);
  }
};

export const showSplashScreen = async () => {
  try {
    await SplashScreen.show({
      autoHide: false,
    });
  } catch (error) {
    console.error('Splash screen show error:', error);
  }
};

/**
 * Status Bar Functions
 */
export const setStatusBarStyle = async (style: 'dark' | 'light') => {
  try {
    await StatusBar.setStyle({
      style: style === 'dark' ? Style.Dark : Style.Light,
    });
  } catch (error) {
    console.error('Status bar style error:', error);
  }
};

export const setStatusBarColor = async (color: string) => {
  try {
    await StatusBar.setBackgroundColor({ color });
  } catch (error) {
    console.error('Status bar color error:', error);
  }
};

export const hideStatusBar = async () => {
  try {
    await StatusBar.hide();
  } catch (error) {
    console.error('Status bar hide error:', error);
  }
};

export const showStatusBar = async () => {
  try {
    await StatusBar.show();
  } catch (error) {
    console.error('Status bar show error:', error);
  }
};

/**
 * App Functions
 */
export const addAppStateListener = (callback: (state: { isActive: boolean }) => void) => {
  return App.addListener('appStateChange', callback);
};

export const addBackButtonListener = (callback: () => void) => {
  return App.addListener('backButton', callback);
};

export const exitApp = () => {
  App.exitApp();
};

export const getAppInfo = async () => {
  try {
    const info = await App.getInfo();
    return info;
  } catch (error) {
    console.error('App info error:', error);
    return null;
  }
};

/**
 * Initialize native features
 */
export const initializeNativeFeatures = async () => {
  if (!isNativePlatform()) {
    console.log('Running on web platform, native features disabled');
    return;
  }

  console.log('Initializing native features for', getPlatform());

  try {
    // Set status bar style
    await setStatusBarStyle('light');
    await setStatusBarColor('#1a472a');

    // Hide splash screen after app is ready
    setTimeout(async () => {
      await hideSplashScreen();
    }, 1000);

    // Listen for app state changes
    addAppStateListener((state) => {
      console.log('App state changed:', state.isActive ? 'active' : 'background');
    });

    // Handle back button on Android
    addBackButtonListener(() => {
      // Custom back button handling if needed
      console.log('Back button pressed');
    });

  } catch (error) {
    console.error('Native initialization error:', error);
  }
};
