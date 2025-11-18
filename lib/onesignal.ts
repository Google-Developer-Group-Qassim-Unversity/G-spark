"use client";

export const ONESIGNAL_APP_ID = "cad9d5a4-834d-46ed-b0e4-57e4df6b8f70";
const SDK_URL = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.js";

let sdkLoaded: Promise<any> | null = null;

/* -------------------------
   Load OneSignal SDK Script
-------------------------- */
function loadSDK() {
  if (typeof window === "undefined") return;
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
   Initialize OneSignal (v16)
----------------------------------------- */
export async function initOneSignal() {
  if (typeof window === "undefined") return;

  loadSDK();
  const OneSignal = await waitForSDK();

  try {
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true,
    });

    console.log("[OneSignal v16] Initialized");
  } catch (err) {
    console.error("[OneSignal init error]", err);
  }
}

/* ----------------------------------------
   Ask for permission (native prompt)
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
   Browser notification permission
   "granted" | "denied" | "default"
----------------------------------------- */
export async function getNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined") return "default";
  if (!("Notification" in window)) return "default";

  return Notification.permission;
}

/* ----------------------------------------
   Combined status for UI:
   - browser permission
   - OneSignal subscription (optedIn)
   Use getSubscription() to avoid stale state.
----------------------------------------- */
export async function getSubscriptionInfo(): Promise<{
  permission: NotificationPermission;
  isSubscribed: boolean;
}> {
  if (typeof window === "undefined") {
    return { permission: "default", isSubscribed: false };
  }

  const OneSignal = await waitForSDK();

  const permission: NotificationPermission =
    "Notification" in window ? Notification.permission : "default";

  let isSubscribed = false;

  try {
    const subscription = await OneSignal.User.PushSubscription.getSubscription();
    isSubscribed = !!subscription?.optedIn;
  } catch (e) {
    console.error("[getSubscriptionInfo] getSubscription error", e);
  }

  return {
    permission,
    isSubscribed,
  };
}

/* ----------------------------------------
   Listen for subscription changes.
   Use getSubscription() inside the handler
   so desktop Chrome gets fresh state.
----------------------------------------- */
export async function onSubscriptionChange(
  callback: (isSubscribed: boolean) => void
) {
  if (typeof window === "undefined") return;

  try {
    const OneSignal = await waitForSDK();

    OneSignal.User.PushSubscription.addEventListener(
      "change",
      async () => {
        try {
          const sub = await OneSignal.User.PushSubscription.getSubscription();
          const isSubscribed = !!sub?.optedIn;
          callback(isSubscribed);
        } catch (e) {
          console.error("[subscriptionChange listener] getSubscription error", e);
          callback(false);
        }
      }
    );
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
