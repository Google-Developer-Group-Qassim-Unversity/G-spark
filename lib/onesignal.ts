// src/lib/onesignal.ts

'use client';

// --- Manual Type Declarations ---
// We define the minimum types needed to satisfy TypeScript without installing the SDK package.
type NotificationPermission = 'default' | 'granted' | 'denied';

interface OneSignalCore {
  initialized: boolean;
  init: (options: any) => Promise<void>; 
  push: (command: any) => void;
  // Added for the instant UI update fix in the React component
  on: (event: 'subscriptionChange', callback: (isSubscribed: boolean) => void) => void; 
  Slidedown: {
    promptPush: () => Promise<void>;
  };
  Notifications: {
    getPermission: () => Promise<NotificationPermission>;
    permission: NotificationPermission;
  };
  UserAgent?: { // Optional property for the UserAgent check
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
 * This ensures the SDK is fully loaded and initialized before any methods are called,
 * fixing common timing and race condition errors.
 */
function getOneSignal(): Promise<OneSignalCore | undefined> {
  if (typeof window === 'undefined') return Promise.resolve(undefined);
  
  // If OneSignal is already initialized, return it immediately.
  if (window.OneSignal && (window.OneSignal as any).initialized) {
      return Promise.resolve(window.OneSignal);
  }

  // Otherwise, use the deferred array to wait for the SDK to be ready.
  return new Promise(resolve => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(resolve);
  });
}

/**
 * Initializes the OneSignal Web SDK using the Deferred method.
 * Should be called once on application startup (e.g., in a top-level useEffect).
 */
export function initOneSignal(): void {
  if (typeof window === 'undefined') return;

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  
  window.OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      // safari_web_id: "..." (Only required if specifically configured)
      notifyButton: {
        enable: false, // Disabling the default bell UI
      },
      // Removed local host specific setting; reliance is on HTTPS for the live site.
      serviceWorkerPath: '/OneSignalSDKWorker.js', // Confirmed path from public folder
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
    // Prompt the user
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
 * This is the fix for the UI delay in the React component.
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
  
  // Use OneSignal's UserAgent check if the property is available
  if (window.OneSignal?.UserAgent) {
    return (window.OneSignal.UserAgent as any).isIOS();
  }

  // Fallback check (using 'as any' to avoid MSStream TypeScript error)
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}