'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BellIcon, TrophyIcon, SparklesIcon, UsersIcon, CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { GetInvitationButton } from '@/components/get-invitation-button'; 

interface HeroSectionProps {
  onNotificationsClick: () => void;
  onVotingClick: () => void;
}

export function HeroSection({ onNotificationsClick, onVotingClick }: HeroSectionProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date('2025-12-02T00:00:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    // Reduced pb-20 to pb-12 to pull the next section closer
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white pt-16 pb-3">
      
      {/* --- Sharper, Vibrant Background --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        
        {/* 1. Top Right: Purple/Blue */}
        <div 
          className="absolute -top-[20%] -right-[20%] md:-top-[20%] md:-right-[10%] w-[120vw] h-[120vw] md:w-[70vw] md:h-[70vw] rounded-full blur-[70px] md:blur-[90px] opacity-40"
          style={{ background: 'radial-gradient(circle, #A112F4 0%, #4285F4 50%, transparent 80%)' }} 
        />

        {/* 2. Bottom Left: Pink/Red */}
        <div 
          className="absolute -bottom-[20%] -left-[20%] md:-bottom-[20%] md:-left-[10%] w-[120vw] h-[120vw] md:w-[60vw] md:h-[60vw] rounded-full blur-[70px] md:blur-[90px] opacity-35"
          style={{ background: 'radial-gradient(circle, #FF4473 0%, #EA4335 50%, transparent 80%)' }}
        />

        {/* 3. Center Floating Element: Yellow/Green */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] rounded-full blur-[60px] md:blur-[80px] opacity-30 mix-blend-overlay"
          style={{ background: 'radial-gradient(circle, #FBBC05 0%, #34A853 50%, transparent 80%)' }}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* 4. Tiny "Spark" dots */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-[#FBBC05] blur-[1px]"
          animate={{ y: [0, -20, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-4 h-4 rounded-full bg-[#4285F4] blur-[1px]"
          animate={{ y: [0, 30, 0], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, delay: 1, ease: "easeInOut" }}
        />
      </div>

      {/* Connector Gradient (Bottom Fade) */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white via-white/80 to-transparent z-0 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 py-10">
        <div className="max-w-7xl mx-auto">
          {/* Logo and Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="flex justify-center mb-6">
              <Image
                src="/images/design-mode/logo-without_bg.png"
                alt="G-Spark Logo"
                width={900}
                height={270}
                className="w-full max-w-full sm:max-w-lg md:max-w-3xl lg:max-w-4xl object-contain max-h-72 sm:max-h-80 md:max-h-96 lg:max-h-[480px]"
                priority
              />
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#242E48] mb-6">
              حفل ختام انشطة مجموعة قوقل للطلبة المطورين
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-5">
            سجل معنا الآن عشان توصلك بطاقة الحضور 🤩
            </p>

            <div className="flex flex-col items-center justify-center gap-3 mb-8">
              <GetInvitationButton 
                className="bg-black hover:bg-gray-800 text-white text-lg px-12 py-7 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
                text="سجل الآن"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={onNotificationsClick}
                className="bg-[#4285F4] text-white hover:bg-[#357AE8] border-none font-bold text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              >
                <BellIcon className="ml-2 h-5 w-5" />
                فعل الاشعارات
              </Button>
              <Button
                size="lg"
                onClick={onVotingClick}
                className="bg-[#EA4335] text-white hover:bg-[#D93025] border-none font-bold text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              >
                <TrophyIcon className="ml-2 h-5 w-5" />
                صوت لفريق
              </Button>
            </div>
          </motion.div>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-20"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-[#242E48] mb-2 flex items-center justify-center gap-2">
                <CalendarIcon className="h-6 w-6 text-[#4285F4]" />
                العد التنازلي للحدث
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto px-2" dir="ltr">
              {[
                { label: 'Days', value: timeLeft.days, label_ar: 'يوم' },
                { label: 'Hours', value: timeLeft.hours, label_ar: 'ساعة' },
                { label: 'Minutes', value: timeLeft.minutes, label_ar: 'دقيقة' },
                { label: 'Seconds', value: timeLeft.seconds, label_ar: 'ثانية' },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="relative group"
                >
                  <div className="relative bg-white/80 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col items-center justify-center text-center">
                    <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#4285F4] mb-2">
                      {String(item.value).padStart(2, '0')}
                    </div>
                    <div className="text-xs sm:text-sm md:text-base text-gray-600 font-semibold">
                      {item.label}
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-xs text-gray-500 mt-1">{item.label_ar}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {[
              {
                icon: <SparklesIcon className="h-8 w-8" />,
                title: 'مشاريع مبتكرة',
                description: 'استعرض أفضل المشاريع التقنية المقدمة من الطلاب',
                color: '#4285F4',
              },
              {
                icon: <TrophyIcon className="h-8 w-8" />,
                title: 'تصويت تفاعلي',
                description: 'شارك في اختيار أفضل مشروع وساهم في تحديد الفائزين',
                color: '#EA4335',
              },
              {
                icon: <UsersIcon className="h-8 w-8" />,
                title: 'تواصل مجتمعي',
                description: 'تعرف على المطورين والمبتكرين في مجتمع التقنية',
                color: '#34A853',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                className="group relative"
              >
                <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div
                      className="inline-flex p-3 rounded-xl"
                      style={{ backgroundColor: feature.color }}
                    >
                      <div className="text-white">{feature.icon}</div>
                    </div>
                    <h3 className="text-xl font-bold text-[#242E48]">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}