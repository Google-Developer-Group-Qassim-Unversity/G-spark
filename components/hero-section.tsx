'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BellIcon, TrophyIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Calendar, Bell, TrendingUp } from 'lucide-react';

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
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white pt-20">
      {/* Gradient Background - Positioned on the right/bottom */}
      <div className="absolute right-0 bottom-0 w-1/2 h-3/4 hero-gradient opacity-60 blur-3xl" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Logo, Text, and Buttons */}
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex justify-start">
              <Image
                src="/images/design-mode/logo-without_bg.png"
                alt="G-Spark Logo"
                width={600}
                height={200}
                className="w-full max-w-md animate-fade-in"
                priority
              />
            </div>

            {/* Tagline */}
            <h2 
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--gspark-dark)] text-balance animate-fade-in-up" 
            >
              حفل ختام انشطة مجموعة قوقل للطلبة المطورين
            </h2>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-200">
              <Button
                size="lg"
                onClick={onNotificationsClick}
                className="bg-[var(--gspark-blue)] text-white hover:bg-[var(--gspark-blue)]/90 font-bold text-base md:text-lg px-8 py-6 rounded-xl shadow-lg transition-transform hover:scale-105"
              >
                <BellIcon className="ml-2 h-5 w-5" />
                فعل الاشعارات
              </Button>
              <Button
                size="lg"
                onClick={onVotingClick}
                className="bg-[var(--gspark-purple)] text-white hover:bg-[var(--gspark-purple)]/90 font-bold text-base md:text-lg px-8 py-6 rounded-xl shadow-lg transition-transform hover:scale-105"
              >
                <TrophyIcon className="ml-2 h-5 w-5" />
                صوت لفريق
              </Button>
            </div>
          </div>

          {/* Right side - Countdown in bottom right */}
          <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-12"
        >
          <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
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
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl"
              >
                <div className="text-4xl md:text-5xl font-bold text-[#4285F4] mb-2">
                  {String(item.value).padStart(2, '0')}
                </div>
                <div className="text-sm md:text-base text-gray-600 font-medium">
                  {item.label}
                </div>
                <div className="text-xs text-gray-500 mt-1 arabic-text">{item.label_ar}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        </div>
      </div>
    </section>
  );
}
