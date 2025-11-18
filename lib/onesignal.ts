"use client";

export const ONESIGNAL_APP_ID = "cad9d5a4-834d-46ed-b0e4-57e4df6b8f70";
const SDK_URL = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.js";

let sdkLoaded: Promise<any> | null = null;

function loadSDK() {
  if (document.getElementById("onesignal-sdk")) return;

  const script = document.createElement("script");
  script.id = "onesignal-sdk";
  script.src = SDK_URL;
  script.async = true;
  document.head.appendChild(script);
}

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

export async function subscribeToNotifications() {
  try {
    const OneSignal = await waitForSDK();
    return await OneSignal.Notifications.requestPermission();
  } catch (err) {
    console.error("[subscribe error]", err);
    return "default";
  }
}

export async function getNotificationPermission() {
  try {
    const OneSignal = await waitForSDK();
    return await OneSignal.Notifications.getPermission();
  } catch {
    return "default";
  }
}

export async function getSubscriptionInfo() {
  const OneSignal = (window as any).OneSignal;
  if (!OneSignal) return { permission: "default", isSubscribed: false };

  const permission = await OneSignal.Notifications.getPermission();
  const subscription = await OneSignal.User.PushSubscription.getSubscription();

  return {
    permission,
    isSubscribed: subscription?.optedIn ?? false,
  };
}

export async function onSubscriptionChange(callback: (isSubscribed: boolean) => void) {
  try {
    const OneSignal = await waitForSDK();

    OneSignal.User.addEventListener("subscriptionChange", async () => {
      const sub = await OneSignal.User.PushSubscription.getSubscription();
      callback(sub?.optedIn ?? false);
    });
  } catch (err) {
    console.error("[subscriptionChange error]", err);
  }
}

export function isIOS() {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}
