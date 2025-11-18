'use client';

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void>;
    OneSignal?: any;
  }
}

export const ONESIGNAL_APP_ID = 'edcedcb7-ca83-4e15-ae44-6b6ac8e30bd2';

export function initOneSignal() {
  if (typeof window === 'undefined') return;

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  
  window.OneSignalDeferred.push(async function(OneSignal: any) {
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      safari_web_id: "web.onesignal.auto.undefined",
      notifyButton: {
        enable: false,
      },
      allowLocalhostAsSecureOrigin: true,
    });
  });
}

export async function subscribeToNotifications(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.OneSignal) return false;

  try {
    await window.OneSignal.Slidedown.promptPush();
    const permission = await window.OneSignal.Notifications.permission;
    return permission;
  } catch (error) {
    console.error('[v0] OneSignal subscription error:', error);
    return false;
  }
}

export async function getNotificationPermission(): Promise<string> {
  if (typeof window === 'undefined' || !window.OneSignal) return 'default';

  try {
    const permission = await window.OneSignal.Notifications.permission;
    return permission ? 'granted' : 'default';
  } catch (error) {
    console.error('[v0] OneSignal permission check error:', error);
    return 'default';
  }
}

export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}
