'use client';

import { Navbar } from '@/components/navbar';
import { HeroSection } from '@/components/hero-section';
import { NotificationsSection } from '@/components/notifications-section';
import { VotingSection } from '@/components/voting-section';
import { Toaster } from '@/components/ui/toaster';

export default function HomePage() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <HeroSection
          onNotificationsClick={() => scrollToSection('notifications')}
          onVotingClick={() => scrollToSection('voting')}
        />
        <NotificationsSection />
        <VotingSection />
        <Toaster />
      </main>
    </>
  );
}
