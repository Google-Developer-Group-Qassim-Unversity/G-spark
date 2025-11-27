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
    // REMOVED min-h-screen, CHANGED py-20 to py-12 for tighter gap
    <section
      id="notifications"
      className="relative flex items-center justify-center py-3 overflow-hidden bg-white"
    >
      {/* --- FIXED: Sharper Background Decorations --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        
        {/* Top Left: Green Blob */}
        <div 
          className="absolute -top-[10%] -left-[20%] md:-top-[10%] md:-left-[10%] w-[100vw] h-[100vw] md:w-[60vw] md:h-[60vw] rounded-full blur-[70px] md:blur-[90px] opacity-35"
          style={{ background: 'radial-gradient(circle, #34A853 0%, #81C995 50%, transparent 80%)' }} 
        />

        {/* Bottom Right: Yellow Blob */}
        <div 
          className="absolute -bottom-[10%] -right-[20%] md:-bottom-[10%] md:-right-[10%] w-[100vw] h-[100vw] md:w-[60vw] md:h-[60vw] rounded-full blur-[70px] md:blur-[90px] opacity-35"
          style={{ background: 'radial-gradient(circle, #FBBC05 0%, #F4B46B 50%, transparent 80%)' }}
        />

        {/* Floating Spark Dots */}
        <motion.div 
          className="absolute top-1/3 right-[10%] w-4 h-4 rounded-full bg-[#34A853] blur-[1px]"
          animate={{ y: [0, -30, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-[15%] w-3 h-3 rounded-full bg-[#FBBC05] blur-[1px]"
          animate={{ y: [0, 20, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-white via-white/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white via-white/80 to-transparent z-10 pointer-events-none" />

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
          <Card className="shadow-2xl shadow-gray-200/50 border border-white/50 bg-white/60 backdrop-blur-xl overflow-hidden">
            <CardHeader className="text-center px-6 py-8 border-b border-gray-100/50">
              <CardTitle className="text-2xl text-[#242E48]" dir="rtl">
                إشعارات الحفل
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 px-6 py-8">
              {/* Status Alert */}
              {isDenied && (
                <div className="bg-[#EA4335]/10 border-[#EA4335]/20 rounded-xl border p-4 transition-all duration-300">
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
                <div className="bg-[#4285F4]/10 border border-[#4285F4]/20 rounded-xl p-6 space-y-4">
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

              {/* Benefits List */}
              {(
                <div className="bg-white/50 border border-white/50 rounded-xl p-6 space-y-4">
                  <h4 className="font-bold text-[#242E48] text-right text-base" dir="rtl">
                    ليش تفّعل الاشعارات؟ 
                  </h4>
                  <ul className="space-y-3 text-right" dir="rtl">
                    {[
                      "💡 عشان توصلك أخبار ومستجدات الحفل",
                      "📅 تجيك اشعارات عن مواعيد فعاليات الحفل",
                      "🏆  تتابع الفائزين مباشرة اثناء الحفل",
                    ].map((benefit, index) => (
                      <li key={index} className="text-gray-700 text-sm leading-relaxed flex items-center justify-start gap-2">
                         <span>{benefit.substring(0, 2)}</span>
                         <span>{benefit.substring(2)}</span>
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