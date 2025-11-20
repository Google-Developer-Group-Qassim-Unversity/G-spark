'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BellIcon, TrophyIcon, SparklesIcon, UsersIcon, CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white pt-28 pb-20">
      {/* Enhanced Background with Decorative Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Existing subtle gradient blobs */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#4285F4]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#EA4335]/5 rounded-full blur-3xl" />
        
        {/* New decorative floating blobs - adjusted for mobile */}
        <motion.div 
          className="absolute top-32 left-2 md:left-16 w-32 h-32 md:w-64 md:h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{ 
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-48 right-2 md:right-20 w-28 h-28 md:w-56 md:h-56 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{ 
            y: [0, 25, 0],
            x: [0, -15, 0],
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute bottom-40 left-4 md:left-1/4 w-28 h-28 md:w-48 md:h-48 bg-[#34A853]/40 rounded-full mix-blend-multiply filter blur-xl opacity-25"
          animate={{ 
            y: [0, -30, 0],
            x: [0, 20, 0],
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute bottom-24 right-4 md:right-1/3 w-24 h-24 md:w-44 md:h-44 bg-[#EA4335]/40 rounded-full mix-blend-multiply filter blur-xl opacity-25"
          animate={{ 
            y: [0, 20, 0],
            x: [0, -10, 0],
          }}
          transition={{ 
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          {/* Logo and Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="flex justify-center mb-8">
              <Image
                src="/images/design-mode/logo-without_bg.png"
                alt="G-Spark Logo"
                width={500}
                height={150}
                className="w-full max-w-lg"
                priority
              />
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#242E48] mb-6">
              حفل ختام انشطة مجموعة قوقل للطلبة المطورين
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              انضم إلينا في احتفالية استثنائية تجمع الابتكار والإبداع التقني
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={onNotificationsClick}
                className="bg-[#4285F4] text-white hover:bg-[#4285F4]/90 font-bold text-lg px-10 py-7 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <BellIcon className="ml-2 h-6 w-6" />
                فعل الاشعارات
              </Button>
              <Button
                size="lg"
                onClick={onVotingClick}
                className="bg-[#EA4335] text-white hover:bg-[#EA4335]/90 font-bold text-lg px-10 py-7 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <TrophyIcon className="ml-2 h-6 w-6" />
                صوت لفريق
              </Button>
            </div>
          </motion.div>

          {/* Countdown Timer */}
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
            <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto" dir="ltr">
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
                  <div className="relative bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="text-5xl md:text-6xl font-bold text-[#4285F4] mb-2">
                      {String(item.value).padStart(2, '0')}
                    </div>
                    <div className="text-sm md:text-base text-gray-600 font-semibold">
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{item.label_ar}</div>
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
                <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
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
