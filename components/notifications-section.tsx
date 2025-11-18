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
  getSubscriptionInfo,
  onSubscriptionChange,
} from "@/lib/onesignal";

type PermissionStatus = "granted" | "denied" | "default";

// كشف الآيفون حتى لو المتصفح مغير الـ userAgent (وضع سطح المكتب)
function detectIOS(): boolean {
  if (typeof window === "undefined") return false;

  const ua = window.navigator.userAgent || "";
  const platform = (window.navigator as any).platform || "";
  const maxTouchPoints = (window.navigator as any).maxTouchPoints || 0;

  const iOSByUA = /iPhone|iPad|iPod/.test(ua);
  const iOSDesktopMode =
    /Macintosh/.test(ua) && maxTouchPoints > 1; // iPad/iPhone مع "طلب موقع سطح المكتب"

  return iOSByUA || iOSDesktopMode || /iPhone|iPad|iPod/.test(platform);
}

export function NotificationsSection() {
  const [permission, setPermission] = useState<PermissionStatus>("default");
  const [subscribing, setSubscribing] = useState(false);
  const [iosInstructions, setIosInstructions] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const { permission } = await getSubscriptionInfo();

      if (permission === "denied") {
        setPermission("denied");
      } else if (permission === "granted") {
        setPermission("granted");
      } else {
        setPermission("default");
      }
    } catch (e) {
      console.error("[checkStatus error]", e);
      setPermission("default");
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await initOneSignal();
      await checkStatus();

      await onSubscriptionChange((perm) => {
        if (perm === "denied") setPermission("denied");
        else if (perm === "granted") setPermission("granted");
        else setPermission("default");
      });

      setIosInstructions(detectIOS());
    };

    run();
  }, [checkStatus]);

  async function handleSubscribe() {
    if (subscribing) return;

    setSubscribing(true);

    try {
      await subscribeToNotifications();

      await new Promise((r) => setTimeout(r, 100));
      await checkStatus();
    } catch (err) {
      console.error("Subscribe error:", err);
    } finally {
      setSubscribing(false);
    }
  }

  const isGranted = permission === "granted";
  const isDenied = permission === "denied";

  return (
    <section
      id="notifications"
      dir="rtl"
      className="min-h-screen flex items-center justify-center py-20 bg-gradient-to-br from-[var(--gspark-dark)] to-[var(--gspark-blue)]"
    >
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto glass border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <BellIcon className="h-16 w-16 text-[var(--gspark-blue)]" />
            </div>

            <CardTitle className="text-3xl md:text-4xl font-bold text-white mb-2">
              فعل الاشعارات
            </CardTitle>

            <CardDescription className="text-lg text-white/80">
              فعل الاشعارات للحصول على التحديثات
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 text-right">
            <Alert
              className={`${
                isGranted
                  ? "bg-[var(--gspark-green)]/20 border-[var(--gspark-green)]"
                  : isDenied
                  ? "bg-[var(--gspark-red)]/20 border-[var(--gspark-red)]"
                  : "bg-white/10 border-white/20"
              }`}
            >
              <div className="flex items-center gap-3 flex-row-reverse">
                {isGranted ? (
                  <CheckCircle2Icon className="h-5 w-5 text-[var(--gspark-green)]" />
                ) : isDenied ? (
                  <XCircleIcon className="h-5 w-5 text-[var(--gspark-red)]" />
                ) : (
                  <AlertCircleIcon className="h-5 w-5 text-[var(--gspark-yellow)]" />
                )}

                <AlertDescription className="text-white font-medium">
                  {isGranted
                    ? "تم تفعيل الاشعارات!"
                    : isDenied
                    ? "تم ايقاف الاشعارات من قبل المتصفح الخاص بك 😞"
                    : "لم تقم بتفعيل الاشعارات😒"}
                </AlertDescription>
              </div>

              {isDenied && (
                <p className="text-white/80 mt-2 text-sm">
                  يجب ان تقوم بالغاء الحظر من المتصفح لكي تتمكن من تفعيل 
                  الاشعارات مجددا.
                </p>
              )}
            </Alert>

            {!isDenied && (
              <Button
                size="lg"
                disabled={subscribing}
                onClick={handleSubscribe}
                className="w-full bg-[var(--gspark-blue)] hover:bg-[var(--gspark-blue)]/90 text-white font-bold text-lg py-6 rounded-xl shadow-lg"
              >
                {subscribing
                  ? "الاشتراك بالاشعارات..."
                  : isGranted
                  ? "التحقق من الاشعارات"
                  : "تفعيل الاشعارات"}
              </Button>
            )}

            {iosInstructions && (
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <SmartphoneIcon className="h-5 w-5 text-[var(--gspark-yellow)]" />
                    <CardTitle className="text-lg text-white">
                      لمستخدمين الايفون
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="text-white/80 text-sm space-y-2">
                  <p className="font-semibold text-white">
                    لتفعيل الاشعارات عبر الايفون:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 mr-2">
                    <li>الضغط على زر المشاركة</li>
                    <li>اضغط على اضافة الى الصفحة الرئيسية</li>
                    <li>قم بفتح التطبيق عبر الصفحة الرئيسية</li>
                    <li>اضغط السماح بالاشعارات</li>
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
