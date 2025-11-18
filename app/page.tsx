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
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
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
