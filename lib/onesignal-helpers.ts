"use client";

import OneSignal from 'react-onesignal';

/**
 * Request notification permission from the user
 * This will show the native browser permission prompt
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false;
    
    // Using OneSignal's Notifications API to request permission
    const result = await OneSignal.Notifications.requestPermission();
    console.log('[OneSignal] Permission request result:', result);
    return result;
  } catch (error) {
    console.error('[OneSignal] Error requesting permission:', error);
    return false;
  }
}

/**
 * Get the current notification permission status
 * Returns: "granted" | "denied" | "default"
 */
export async function getNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined') return 'default';
  
  try {
    // Check browser's Notification API directly
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  } catch (error) {
    console.error('[OneSignal] Error getting permission:', error);
    return 'default';
  }
}

/**
 * Check if the user is subscribed to push notifications
 */
export async function isPushSubscribed(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false;
    
    const permission = await getNotificationPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('[OneSignal] Error checking subscription:', error);
    return false;
  }
}

/**
 * Add a listener for permission changes
 */
export function onPermissionChange(
  callback: (permission: NotificationPermission) => void
): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Listen to OneSignal's push subscription changes
    OneSignal.User.PushSubscription.addEventListener('change', async () => {
      const permission = await getNotificationPermission();
      callback(permission);
    });
  } catch (error) {
    console.error('[OneSignal] Error setting up permission listener:', error);
  }
}

/**
 * Utility: Detect iOS devices
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  
  const ua = window.navigator.userAgent || '';
  const maxTouchPoints = (window.navigator as any).maxTouchPoints || 0;
  
  return (
    /iPhone|iPad|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && maxTouchPoints > 1)
  );
}

/**
 * Utility: Detect iOS Safari specifically
 */
export function isIOSSafari(): boolean {
  if (!isIOS()) return false;
  
  const ua = window.navigator.userAgent || '';
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
  
  return isSafari;
}

/**
 * Set external user ID for user identification
 */
export async function setExternalUserId(userId: string): Promise<void> {
  try {
    if (typeof window === 'undefined') return;
    
    await OneSignal.login(userId);
    console.log('[OneSignal] External user ID set:', userId);
  } catch (error) {
    console.error('[OneSignal] Error setting external user ID:', error);
  }
}

/**
 * Add a tag to the user
 */
export async function addTag(key: string, value: string): Promise<void> {
  try {
    if (typeof window === 'undefined') return;
    
    await OneSignal.User.addTag(key, value);
    console.log('[OneSignal] Tag added:', key, value);
  } catch (error) {
    console.error('[OneSignal] Error adding tag:', error);
  }
}

/**
 * Add multiple tags to the user
 */
export async function addTags(tags: Record<string, string>): Promise<void> {
  try {
    if (typeof window === 'undefined') return;
    
    await OneSignal.User.addTags(tags);
    console.log('[OneSignal] Tags added:', tags);
  } catch (error) {
    console.error('[OneSignal] Error adding tags:', error);
  }
}

/**
 * Get the OneSignal subscription ID
 */
export async function getSubscriptionId(): Promise<string | null> {
  try {
    if (typeof window === 'undefined') return null;
    
    const subscriptionId = await OneSignal.User.PushSubscription.id;
    return subscriptionId || null;
  } catch (error) {
    console.error('[OneSignal] Error getting subscription ID:', error);
    return null;
  }
}
