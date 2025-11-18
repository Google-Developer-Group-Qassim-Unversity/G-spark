'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* GDG Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/gdg-logo.png"
            alt="Google Developer Groups"
            width={48}
            height={48}
            className="w-12 h-12"
          />
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection('notifications')}
            className="text-[var(--gspark-dark)] hover:text-[var(--gspark-blue)] font-medium transition-colors"
          >
            اشعارات
          </button>
          <button
            onClick={() => scrollToSection('voting')}
            className="text-[var(--gspark-dark)] hover:text-[var(--gspark-blue)] font-medium transition-colors"
          >
            تصويت
          </button>
          <button
            onClick={() => {}}
            className="text-[var(--gspark-dark)] hover:text-[var(--gspark-blue)] font-medium transition-colors"
          >
            فعاليات
          </button>
          <button
            onClick={() => {}}
            className="text-[var(--gspark-dark)] hover:text-[var(--gspark-blue)] font-medium transition-colors"
          >
            عن الحفل
          </button>
        </div>

        {/* Sign In/Sign Up */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-[var(--gspark-dark)] hover:bg-gray-100"
          >
            Sign In
          </Button>
          <Button
            className="bg-[var(--gspark-blue)] text-white hover:bg-[var(--gspark-blue)]/90"
          >
            Sign Up
          </Button>
        </div>
      </div>
    </nav>
  );
}
