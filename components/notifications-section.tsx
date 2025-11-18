"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BellIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  SmartphoneIcon,
  XCircleIcon,
} from "lucide-react";

import {
  initOneSignal,
  subscribeToNotifications,
  getNotificationPermission,
  isIOS,
  onSubscriptionChange,
} from "@/lib/onesignal";

type PermissionStatus = "granted" | "denied" | "default";

export function NotificationsSection() {
  const [permission, setPermission] = useState<PermissionStatus>("default");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const checkPermission = useCallback(async () => {
    try {
      const perm = await getNotificationPermission();
      setPermission(perm as PermissionStatus);
    } catch (error) {
      console.error("Failed to get notification permission:", error);
      setPermission("default");
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await initOneSignal();    
      await checkPermission(); 

      onSubscriptionChange(() => {
        checkPermission();
      });

      setShowIOSInstructions(isIOS());
    };

    init();
  }, [checkPermission]);

  const handleSubscribe = async () => {
    if (isSubscribing) return;

    setIsSubscribing(true);

    try {
      await subscribeToNotifications();
    } catch (error) {
      console.error("[OneSignal] Subscription failed:", error);
    } finally {
      await checkPermission(); 
      setIsSubscribing(false);
    }
  };

  const isGranted = permission === "granted";
  const isDenied = permission === "denied";

  return (
    <section
      id="notifications"
      className="min-h-screen flex items-center justify-center py-20 bg-gradient-to-br from-[var(--gspark-dark)] to-[var(--gspark-blue)]"
    >
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto glass border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <BellIcon className="h-16 w-16 text-[var(--gspark-blue)]" />
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold text-white mb-2">
              Enable Notifications
            </CardTitle>
            <CardDescription
              className="text-lg text-white/80"
              style={{ direction: "rtl" }}
            >
              فعل الاشعارات للحصول على التحديثات
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert
              className={`${
                isGranted
                  ? "bg-[var(--gspark-green)]/20 border-[var(--gspark-green)]"
                  : isDenied
                  ? "bg-[var(--gspark-red)]/20 border-[var(--gspark-red)]"
                  : "bg-white/10 border-white/20"
              }`}
            >
              <div className="flex items-center gap-3">
                {isGranted ? (
                  <CheckCircle2Icon className="h-5 w-5 text-[var(--gspark-green)]" />
                ) : isDenied ? (
                  <XCircleIcon className="h-5 w-5 text-[var(--gspark-red)]" />
                ) : (
                  <AlertCircleIcon className="h-5 w-5 text-[var(--gspark-yellow)]" />
                )}
                <AlertDescription className="text-white font-medium">
                  {isGranted
                    ? "✅ Notifications are enabled!"
                    : isDenied
                    ? "❌ Notifications are blocked by your browser settings."
                    : "⚠️ Notifications are not enabled"}
                </AlertDescription>
              </div>

              {isDenied && (
                <p className="text-white/80 mt-2 text-sm">
                  To subscribe, you must manually change permission settings for
                  this site in your browser.
                </p>
              )}
            </Alert>

            {!isDenied && (
              <Button
                size="lg"
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className="w-full bg-[var(--gspark-blue)] hover:bg-[var(--gspark-blue)]/90 text-white font-bold text-lg py-6 rounded-xl shadow-lg"
              >
                {isSubscribing
                  ? "Subscribing..."
                  : isGranted
                  ? "Re-check Subscription"
                  : "Enable Push Notifications"}
              </Button>
            )}

            {showIOSInstructions && (
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <SmartphoneIcon className="h-5 w-5 text-[var(--gspark-yellow)]" />
                    <CardTitle className="text-lg text-white">
                      iPhone Users
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-white/80 text-sm space-y-2">
                  <p className="font-semibold text-white">
                    To enable notifications on iPhone:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Tap the Share button</li>
                    <li>Select "Add to Home Screen"</li>
                    <li>Tap Add</li>
                    <li>Open the app from your home screen</li>
                    <li>Allow notifications when prompted</li>
                  </ol>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
