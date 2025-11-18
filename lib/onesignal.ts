"use client";

export const ONESIGNAL_APP_ID = "cad9d5a4-834d-46ed-b0e4-57e4df6b8f70";
const SDK_URL = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.js";

let sdkLoaded: Promise<any> | null = null;

/* -------------------------
   Load OneSignal SDK Script
-------------------------- */
function loadSDK() {
  if (document.getElementById("onesignal-sdk")) return;

  const script = document.createElement("script");
  script.id = "onesignal-sdk";
  script.src = SDK_URL;
  script.async = true;
  document.head.appendChild(script);
}

/* ----------------------------------------
   Wait for OneSignal to be available
----------------------------------------- */
function waitForSDK() {
  if (sdkLoaded) return sdkLoaded;

  sdkLoaded = new Promise((resolve) => {
    const check = () => {
      const os = (window as any).OneSignal;
      if (os?.init) resolve(os);
      else setTimeout(check, 25);
    };
    check();
  });

  return sdkLoaded;
}

/* ----------------------------------------
   Initialize OneSignal (v16 config)
----------------------------------------- */
export async function initOneSignal() {
  if (typeof window === "undefined") return;

  loadSDK();
  const OneSignal = await waitForSDK();

  try {
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,

      // Do NOT specify serviceWorkerPath in v16.
      // Make sure your workers are in /public
      // OneSignal auto-detects them.

      allowLocalhostAsSecureOrigin: true,

      // OPTIONAL — only add this if you have a Safari Web ID
      // safari_web_id: process.env.NEXT_PUBLIC_OS_SAFARI_WEB_ID,
    });

    console.log("[OneSignal v16] Initialized");
  } catch (err) {
    console.error("[OneSignal init error]", err);
  }
}

/* ----------------------------------------
   Ask for permission and subscribe
----------------------------------------- */
export async function subscribeToNotifications() {
  try {
    const OneSignal = await waitForSDK();
    const result = await OneSignal.Notifications.requestPermission();
    return result;
  } catch (err) {
    console.error("[subscribe error]", err);
    return "default";
  }
}

/* ----------------------------------------
   Get current browser permission
----------------------------------------- */
export async function getNotificationPermission() {
  try {
    const OneSignal = await waitForSDK();
    return await OneSignal.Notifications.getPermission();
  } catch {
    return "default";
  }
}

/* ----------------------------------------
   Event listener for subscription changes
----------------------------------------- */
export async function onSubscriptionChange(
  callback: (isSubscribed: boolean) => void
) {
  try {
    const OneSignal = await waitForSDK();
    OneSignal.User.addEventListener("subscriptionChange", (ev: any) => {
      callback(ev.detail.isSubscribed);
    });
  } catch (err) {
    console.error("[subscriptionChange error]", err);
  }
}

/* ----------------------------------------
   Utility: Detect iOS (for PWA instructions)
----------------------------------------- */
export function isIOS() {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}
