"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {BellIcon, CheckCircle2Icon, AlertCircleIcon, SmartphoneIcon, XCircleIcon, BellRingIcon} from "lucide-react";
import { OneSignalCustomPrompt } from "@/components/onesignal-custom-prompt";
import { motion } from "framer-motion";
import {
  requestNotificationPermission,
  getNotificationPermission,
  onPermissionChange,
  isIOSSafari
} from "@/lib/onesignal-helpers";

type PermissionStatus = "granted" | "denied" | "default";

export function NotificationsSection() {
  const [permission, setPermission] = useState<PermissionStatus>("default");
  const [subscribing, setSubscribing] = useState(false);
  const [iosInstructions, setIosInstructions] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const currentPermission = await getNotificationPermission();
      setPermission(currentPermission);
    } catch (e) {
      console.error("[checkStatus error]", e);
      setPermission("default");
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await checkStatus();
      onPermissionChange((perm) => {
        setPermission(perm);
      });
      setIosInstructions(isIOSSafari());
    };
    run();
  }, [checkStatus]);

  async function handleSubscribe() {
    if (subscribing) return;
    setSubscribing(true);
    try {
      await requestNotificationPermission();
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
      className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden bg-white"
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-15"
          style={{ background: 'radial-gradient(circle, #34A853 0%, #81C995 60%, transparent 100%)' }} 
        />
        <div 
          className="absolute -bottom-[10%] -right-[10%] w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-15"
          style={{ background: 'radial-gradient(circle, #FBBC05 0%, #F4B46B 60%, transparent 100%)' }}
        />
        <motion.div 
          className="absolute top-1/3 right-[10%] w-4 h-4 rounded-full bg-[#34A853] blur-[2px]"
          animate={{ y: [0, -30, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-[15%] w-3 h-3 rounded-full bg-[#FBBC05] blur-[1px]"
          animate={{ y: [0, 20, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-4"
            >
              <div className="bg-[#4285F4] p-4 rounded-2xl shadow-lg shadow-[#4285F4]/20">
                <BellRingIcon className="h-12 w-12 text-white" />
              </div>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#242E48] mb-3" dir="rtl">
              فعل الاشعارات
            </h2>
            <p className="text-lg text-gray-600" dir="rtl">
              عشان تعرف اول باول عن اخبار الحفل
            </p>
          </div>

          {/* Main Card */}
          <Card className="shadow-2xl shadow-gray-200/50 border border-gray-100 bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="text-center px-6 py-8 border-b border-gray-50">
              <CardTitle className="text-2xl text-[#242E48]" dir="rtl">
                إشعارات الحفل
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 px-6 py-8">
              {/* Status Alert */}
              {isDenied && (
                <div className="bg-[#EA4335]/5 border-[#EA4335]/20 rounded-xl border p-4 transition-all duration-300">
                  <div className="flex items-start gap-3" dir="rtl">
                    <div className="shrink-0 mt-0.5">
                      <XCircleIcon className="h-6 w-6 text-[#EA4335]" />
                    </div>

                    <div className="flex-1 min-w-0 text-right space-y-1">
                      <p className="text-[#242E48] font-semibold text-base leading-relaxed">
                        ⚠️ الاشعارات محظورة
                      </p>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        يرجى إلغاء حظر الإشعارات من إعدادات المتصفح لتتمكن من تفعيلها مجدداً
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* OneSignal Prompt */}
              {!isDenied && (
                <OneSignalCustomPrompt isSubscribed={isGranted} />
              )}

              {/* iOS Instructions */}
              {iosInstructions && (
                <div className="bg-[#4285F4]/5 border border-[#4285F4]/20 rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-2 justify-end flex-col-reverse" dir="rtl">
                    <h4 className="text-lg text-[#242E48] font-bold">
                      لازم تتبع هذي الخطوات عشان تفعل الاشعارات على اجهزة IOS
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

              {/* Benefits List - FIXED ALIGNMENT */}
              {(
                <div className="bg-gray-50/80 rounded-xl p-6 space-y-4">
                  <h4 className="font-bold text-[#242E48] text-right text-base" dir="rtl">
                    ليش تفّعل الاشعارات؟ 
                  </h4>
                  <ul className="space-y-3 text-right" dir="rtl">
                    {[
                      "💡 عشان توصلك أخبار ومستجدات الحفل",
                      "📅 تجيك اشعارات عن مواعيد فعاليات الحفل",
                      "🏆  تتابع الفائزين مباشرة اثناء الحفل",
                    ].map((benefit, index) => (
                      // Changed justify-end to justify-start and swapped span order
                      <li key={index} className="text-gray-700 text-sm leading-relaxed flex items-center justify-start gap-2">
                         <span>{benefit.substring(0, 2)}</span> {/* Emoji First (Right) */}
                         <span>{benefit.substring(2)}</span>    {/* Text Second (Left) */}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}