// src/lib/onesignal.ts

'use client';

// --- Manual Type Declarations ---
// This section provides types directly, avoiding the need for the problematic 'import type' statement.
type NotificationPermission = 'default' | 'granted' | 'denied';

interface OneSignalCore {
  initialized: boolean;
  init: (options: any) => Promise<void>; 
  push: (command: any) => void;
  on: (event: 'subscriptionChange', callback: (isSubscribed: boolean) => void) => void; 
  Slidedown: {
    promptPush: () => Promise<void>;
  };
  Notifications: {
    getPermission: () => Promise<NotificationPermission>;
    permission: NotificationPermission;
  };
  UserAgent?: {
    isIOS: () => boolean;
  };
}

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: OneSignalCore) => void>;
    OneSignal?: OneSignalCore;
  }
}
// --- End Manual Type Declarations ---


export const ONESIGNAL_APP_ID = 'cad9d5a4-834d-46ed-b0e4-57e4df6b8f70';

/**
 * ⭐️ HELPER FUNCTION: Resolves the OneSignal object asynchronously.
 * This ensures the SDK is fully ready before calling methods.
 */
function getOneSignal(): Promise<OneSignalCore | undefined> {
  if (typeof window === 'undefined') return Promise.resolve(undefined);
  
  if (window.OneSignal && (window.OneSignal as any).initialized) {
      return Promise.resolve(window.OneSignal);
  }

  return new Promise(resolve => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(resolve);
  });
}

/**
 * Initializes the OneSignal Web SDK.
 */
export function initOneSignal(): void {
  if (typeof window === 'undefined') return;

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  
  window.OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      notifyButton: {
        enable: false,
      },
      serviceWorkerPath: '/OneSignalSDKWorker.js',
    });
    console.log('[OneSignal] SDK Initialized.');
  });
}

/**
 * Prompts the user to subscribe to push notifications.
 */
export async function subscribeToNotifications(): Promise<NotificationPermission> {
  const OneSignal = await getOneSignal();

  if (!OneSignal) {
    console.warn('[OneSignal] SDK not available for subscription.');
    return 'default';
  }

  try {
    await OneSignal.Slidedown.promptPush(); 
    const permission = await OneSignal.Notifications.getPermission();
    return permission; 

  } catch (error) {
    console.error('[OneSignal] Subscription error:', error);
    return 'default';
  }
}

/**
 * Gets the current notification permission status.
 */
export async function getNotificationPermission(): Promise<NotificationPermission> {
  const OneSignal = await getOneSignal();

  if (!OneSignal) { return 'default'; }

  try {
    const permission = await OneSignal.Notifications.getPermission();
    return permission; 
  } catch (error) {
    console.error('[OneSignal] Permission check error:', error);
    return 'default';
  }
}

/**
 * Registers a callback for when the user's subscription status changes.
 */
export async function onSubscriptionChange(callback: (isSubscribed: boolean) => void) {
  const OneSignal = await getOneSignal();
  
  if (!OneSignal) {
    console.warn('[OneSignal] SDK not available for subscription events.');
    return;
  }
  
  OneSignal.push(() => {
    OneSignal.on('subscriptionChange', callback); 
  });
}

/**
 * Helper function to check if the user's device is iOS.
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  
  if (window.OneSignal?.UserAgent) {
    return (window.OneSignal.UserAgent as any).isIOS();
  }

  // Fallback check (using 'as any' to avoid MSStream TypeScript error)
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}