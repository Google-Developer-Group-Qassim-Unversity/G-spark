"use client";

/**
 * Next.js-compatible loader for OneSignal Web SDK v16
 * This version matches your current NotificationsSection.tsx
 */

const ONE_SIGNAL_SDK_URL =
  "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.js";

export const ONESIGNAL_APP_ID =
  "cad9d5a4-834d-46ed-b0e4-57e4df6b8f70";

let oneSignalReady: Promise<any> | null = null;

// Load SDK as <script>, because Next.js cannot import remote ESM modules
function loadOneSignalScript() {
  if (document.getElementById("onesignal-sdk")) return;

  const script = document.createElement("script");
  script.id = "onesignal-sdk";
  script.src = ONE_SIGNAL_SDK_URL;
  script.async = true;
  document.head.appendChild(script);
}

async function waitForOneSignal() {
  if (oneSignalReady) return oneSignalReady;

  oneSignalReady = new Promise((resolve) => {
    const check = () => {
      if ((window as any).OneSignal?.init) {
        resolve((window as any).OneSignal);
      } else {
        setTimeout(check, 30);
      }
    };
    check();
  });

  return oneSignalReady;
}

// 🔵 PUBLIC API FUNCTIONS 🔵

/**
 * Initialize OneSignal v16
 */
export async function initOneSignal() {
  if (typeof window === "undefined") return;

  loadOneSignalScript();

  const OneSignal = await waitForOneSignal();

  try {
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true,
      serviceWorkerPath: "OneSignalSDKWorker.js",
      serviceWorkerUpdaterPath: "OneSignalSDKUpdaterWorker.js",
    });

    console.log("[OneSignal v16] Initialized");
  } catch (err) {
    console.error("[OneSignal init error]", err);
  }
}

/**
 * Request browser notification permission
 */
export async function subscribeToNotifications() {
  try {
    const OneSignal = await waitForOneSignal();
    return await OneSignal.notifications.requestPermission();
  } catch (err) {
    console.error("[OneSignal subscribe error]", err);
    return "default";
  }
}

/**
 * Get current browser notification permission
 */
export async function getNotificationPermission() {
  try {
    const OneSignal = await waitForOneSignal();
    return OneSignal.notifications.getPermission();
  } catch {
    return "default";
  }
}

/**
 * Listen for subscription changes
 */
export async function onSubscriptionChange(
  callback: (isSubscribed: boolean) => void
) {
  try {
    const OneSignal = await waitForOneSignal();
    OneSignal.User.addEventListener("subscriptionChange", (event: any) => {
      callback(event.detail.isSubscribed);
    });
  } catch (err) {
    console.error("[OneSignal subscription listener error]", err);
  }
}

/**
 * Detect iOS devices for PWA instructions
 */
export function isIOS() {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}
