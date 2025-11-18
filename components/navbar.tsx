'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MenuIcon, XIcon } from 'lucide-react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine if navbar should be visible
      if (currentScrollY < 10) {
        setIsVisible(true);
        setIsScrolled(false);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide navbar
        setIsVisible(false);
        setIsScrolled(true);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show navbar
        setIsVisible(true);
        setIsScrolled(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0'
        } ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-xl'
            : 'bg-white/80 backdrop-blur-md shadow-lg'
        } border border-gray-200 rounded-2xl`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* GDG Logo */}
            <Link href="/" className="flex items-center hover:scale-105 transition-transform">
              <Image
                src="/images/gdg-logo.png"
                alt="Google Developer Groups"
                width={48}
                height={48}
                className="w-12 h-12"
              />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-2">
              {[
                { label: 'اشعارات', id: 'notifications' },
                { label: 'تصويت', id: 'voting' },
                { label: 'فعاليات', id: 'events' },
                { label: 'عن الحفل', id: 'about' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="px-4 py-2 text-[#242E48] hover:text-[#4285F4] font-medium transition-all duration-200 rounded-xl hover:bg-[#4285F4]/10 relative group"
                  dir="rtl"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#4285F4] transition-all duration-200 group-hover:w-full"></span>
                </button>
              ))}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                className="text-[#242E48] hover:bg-[#4285F4]/10 hover:text-[#4285F4] rounded-xl px-6 font-semibold transition-all duration-200"
              >
                Sign In
              </Button>
              <Button
                className="bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white hover:shadow-xl rounded-xl px-6 font-semibold transition-all duration-200 hover:scale-105"
              >
                Sign Up
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#242E48] hover:bg-gray-100 rounded-xl transition-colors"
            >
              {mobileMenuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute top-24 left-4 right-4 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 space-y-4 animate-in slide-in-from-top duration-300">
            {[
              { label: 'اشعارات', id: 'notifications' },
              { label: 'تصويت', id: 'voting' },
              { label: 'فعاليات', id: 'events' },
              { label: 'عن الحفل', id: 'about' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="w-full px-4 py-3 text-[#242E48] hover:text-[#4285F4] font-medium text-right rounded-xl hover:bg-[#4285F4]/10 transition-all duration-200"
                dir="rtl"
              >
                {item.label}
              </button>
            ))}

            <div className="pt-4 border-t border-gray-200 space-y-3">
              <Button
                variant="ghost"
                className="w-full text-[#242E48] hover:bg-[#4285F4]/10 hover:text-[#4285F4] rounded-xl font-semibold"
              >
                Sign In
              </Button>
              <Button
                className="w-full bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white hover:shadow-xl rounded-xl font-semibold"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
