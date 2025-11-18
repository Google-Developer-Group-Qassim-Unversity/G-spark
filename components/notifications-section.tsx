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
  BellRingIcon,
} from "lucide-react";
import {
  initOneSignal,
  subscribeToNotifications,
  getSubscriptionInfo,
  onSubscriptionChange,
} from "@/lib/onesignal";

type PermissionStatus = "granted" | "denied" | "default";

function isIOSSafari(): boolean {
  if (typeof window === "undefined") return false;

  const ua = window.navigator.userAgent || "";
  const maxTouchPoints = (window.navigator as any).maxTouchPoints || 0;

  const isIOSDevice =
    /iPhone|iPad|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && maxTouchPoints > 1);

  const isSafari =
    /Safari/.test(ua) &&
    !/Chrome|CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);

  return isIOSDevice && isSafari;
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

      setIosInstructions(isIOSSafari());
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
      className="min-h-screen flex items-center justify-center py-20 bg-gradient-to-br from-white to-gray-50"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-[#4285F4] p-4 rounded-2xl shadow-lg">
                <BellRingIcon className="h-16 w-16 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#242E48] mb-3" dir="rtl">
              فعل الاشعارات
            </h2>
            <p className="text-lg text-gray-600" dir="rtl">
              احصل على تحديثات فورية حول الفعاليات والنتائج
            </p>
          </div>

          {/* Main Card */}
          <Card className="shadow-xl border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-2xl text-[#242E48] text-center" dir="rtl">
                إشعارات الحدث
              </CardTitle>
              <CardDescription className="text-gray-600 text-center" dir="rtl">
                ابقَ على اطلاع بآخر المستجدات
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Status Alert */}
              <Alert
                className={`${
                  isGranted
                    ? "bg-[#34A853]/10 border-[#34A853]"
                    : isDenied
                    ? "bg-[#EA4335]/10 border-[#EA4335]"
                    : "bg-[#FBBC05]/10 border-[#FBBC05]"
                } transition-all duration-300`}
              >
                <div className="flex items-start gap-3 flex-row-reverse">
                  {isGranted ? (
                    <CheckCircle2Icon className="h-6 w-6 text-[#34A853] shrink-0 mt-0.5" />
                  ) : isDenied ? (
                    <XCircleIcon className="h-6 w-6 text-[#EA4335] shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircleIcon className="h-6 w-6 text-[#FBBC05] shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1 text-right" dir="rtl">
                    <AlertDescription className="text-[#242E48] font-semibold text-right leading-relaxed">
                      {isGranted
                        ? "✅ تم تفعيل الاشعارات بنجاح!"
                        : isDenied
                        ? "⚠️ الاشعارات محظورة"
                        : "📢 لم يتم تفعيل الاشعارات بعد"}
                    </AlertDescription>

                    {isDenied && (
                      <p className="text-gray-600 mt-2 text-sm text-right leading-relaxed">
                        يرجى إلغاء حظر الإشعارات من إعدادات المتصفح لتتمكن من تفعيلها مجدداً
                      </p>
                    )}

                    {!isGranted && !isDenied && (
                      <p className="text-gray-600 mt-2 text-sm text-right leading-relaxed">
                        فعّل الإشعارات للحصول على التحديثات الفورية
                      </p>
                    )}
                  </div>
                </div>
              </Alert>

              {/* Action Button */}
              {!isDenied && (
                <Button
                  size="lg"
                  disabled={subscribing}
                  onClick={handleSubscribe}
                  className={`w-full font-bold text-lg py-7 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                    isGranted
                      ? "bg-[#34A853] hover:bg-[#34A853]/90"
                      : "bg-[#4285F4] hover:bg-[#4285F4]/90"
                  } text-white hover:scale-105`}
                  dir="rtl"
                >
                  <BellIcon className="mr-2 h-6 w-6" />
                  {subscribing
                    ? "جاري الاشتراك..."
                    : isGranted
                    ? "التحقق من الاشعارات"
                    : "تفعيل الاشعارات الآن"}
                </Button>
              )}

              {/* Benefits List */}
              {!isDenied && (
                <div className="bg-gray-50 rounded-xl p-6 space-y-3" dir="rtl">
                  <h4 className="font-bold text-[#242E48] text-right mb-4">
                    ماذا ستحصل عند التفعيل:
                  </h4>
                  <ul className="space-y-2 text-right">
                    {[
                      "🎯 تحديثات فورية عن نتائج التصويت",
                      "📅 تذكيرات بمواعيد الفعاليات",
                      "🏆 إعلانات الفائزين مباشرة",
                      "💡 أخبار ومستجدات المجموعة",
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700 justify-end">
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* iOS Instructions */}
              {iosInstructions && (
                <Card className="bg-[#4285F4]/5 border-[#4285F4]/20" dir="rtl">
                  <CardHeader>
                    <div className="flex items-center gap-2 justify-end">
                      <CardTitle className="text-lg text-[#242E48]">
                        تعليمات لمستخدمي آيفون
                      </CardTitle>
                      <SmartphoneIcon className="h-5 w-5 text-[#4285F4]" />
                    </div>
                  </CardHeader>

                  <CardContent className="text-gray-700 text-sm space-y-3 text-right">
                    <p className="font-semibold text-[#242E48]">
                      لتفعيل الإشعارات على Safari (iOS):
                    </p>
                    <ol className="list-decimal list-inside space-y-2 mr-4">
                      <li>اضغط على زر المشاركة (⬆️) في أسفل الشاشة</li>
                      <li>اختر "إضافة إلى الشاشة الرئيسية"</li>
                      <li>افتح التطبيق من الشاشة الرئيسية</li>
                      <li>اضغط "سماح" عند ظهور طلب الإشعارات</li>
                    </ol>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
