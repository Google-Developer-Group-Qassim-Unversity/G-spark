'use client';

import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';

interface AuthButtonProps {
  type: 'signin' | 'signup';
}

export function AuthButton({ type }: AuthButtonProps) {
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const mainAppUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL;

  const handleSignIn = () => {
    window.location.href = `${mainAppUrl}/sign-in?redirect_url=${encodeURIComponent(currentUrl)}`;
  };

  const handleSignUp = () => {
    window.location.href = `${mainAppUrl}/sign-up?redirect_url=${encodeURIComponent(currentUrl)}`;
  };

  if (type === 'signin') {
    return (
      <Button
        onClick={handleSignIn}
        className="bg-[#4285F4] hover:bg-[#357AE8] text-white shadow-lg rounded-xl font-semibold transition-all duration-200"
      >
        <LogIn className="w-5 h-5 ml-2" />
        تسجيل الدخول
      </Button>
    );
  }

  return (
    <Button
      onClick={handleSignUp}
      className="border-2 border-[#4285F4] text-[#4285F4] hover:bg-[#4285F4]/10 bg-transparent rounded-xl font-semibold transition-all duration-200"
    >
      <UserPlus className="w-5 h-5 ml-2" />
      إنشاء حساب جديد
    </Button>
  );
}
