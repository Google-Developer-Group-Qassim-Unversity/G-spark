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
          <Card className="shadow-xl border border-gray-200 bg-white overflow-hidden">
            <CardHeader className="text-center px-6 py-8">
              <CardTitle className="text-2xl text-[#242E48]" dir="rtl">
                إشعارات الحدث
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2" dir="rtl">
                ابقَ على اطلاع بآخر المستجدات
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 px-6 pb-8">
              {/* Status Alert */}
              <div
                className={`${
                  isGranted
                    ? "bg-[#34A853]/10 border-[#34A853]"
                    : isDenied
                    ? "bg-[#EA4335]/10 border-[#EA4335]"
                    : "bg-[#FBBC05]/10 border-[#FBBC05]"
                } rounded-xl border-2 p-4 transition-all duration-300`}
              >
                <div className="flex items-start gap-3" dir="rtl">
                  <div className="shrink-0 mt-0.5">
                    {isGranted ? (
                      <CheckCircle2Icon className="h-6 w-6 text-[#34A853]" />
                    ) : isDenied ? (
                      <XCircleIcon className="h-6 w-6 text-[#EA4335]" />
                    ) : (
                      <AlertCircleIcon className="h-6 w-6 text-[#FBBC05]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-right space-y-1">
                    <p className="text-[#242E48] font-semibold text-base leading-relaxed">
                      {isGranted
                        ? "✅ تم تفعيل الاشعارات بنجاح!"
                        : isDenied
                        ? "⚠️ الاشعارات محظورة"
                        : "📢 لم يتم تفعيل الاشعارات بعد"}
                    </p>

                    {isDenied && (
                      <p className="text-gray-600 text-sm leading-relaxed">
                        يرجى إلغاء حظر الإشعارات من إعدادات المتصفح لتتمكن من تفعيلها مجدداً
                      </p>
                    )}

                    {!isGranted && !isDenied && (
                      <p className="text-gray-600 text-sm leading-relaxed">
                        فعّل الإشعارات للحصول على التحديثات الفورية
                      </p>
                    )}
                  </div>
                </div>
              </div>

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
                >
                  <div className="flex items-center justify-center gap-2" dir="rtl">
                    <span>
                      {subscribing
                        ? "جاري الاشتراك..."
                        : isGranted
                        ? "التحقق من الاشعارات"
                        : "تفعيل الاشعارات الآن"}
                    </span>
                    <BellIcon className="h-6 w-6" />
                  </div>
                </Button>
              )}

              {/* Benefits List */}
              {!isDenied && (
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <h4 className="font-bold text-[#242E48] text-right text-base" dir="rtl">
                    ماذا ستحصل عند التفعيل:
                  </h4>
                  <ul className="space-y-3 text-right" dir="rtl">
                    {[
                      "🎯 تحديثات فورية عن نتائج التصويت",
                      "📅 تذكيرات بمواعيد الفعاليات",
                      "🏆 إعلانات الفائزين مباشرة",
                      "💡 أخبار ومستجدات المجموعة",
                    ].map((benefit, index) => (
                      <li key={index} className="text-gray-700 text-sm leading-relaxed">
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* iOS Instructions */}
              {iosInstructions && (
                <div className="bg-[#4285F4]/5 border-2 border-[#4285F4]/20 rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-2 justify-end" dir="rtl">
                    <h4 className="text-lg text-[#242E48] font-bold">
                      تعليمات لمستخدمي آيفون
                    </h4>
                    <SmartphoneIcon className="h-5 w-5 text-[#4285F4]" />
                  </div>

                  <div className="text-right space-y-3" dir="rtl">
                    <p className="font-semibold text-[#242E48] text-sm">
                      لتفعيل الإشعارات على Safari (iOS):
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm mr-4">
                      <li>اضغط على زر المشاركة (⬆️) في أسفل الشاشة</li>
                      <li>اختر "إضافة إلى الشاشة الرئيسية"</li>
                      <li>افتح التطبيق من الشاشة الرئيسية</li>
                      <li>اضغط "سماح" عند ظهور طلب الإشعارات</li>
                    </ol>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
