'use client';

import { useState, useEffect } from 'react'; // <-- ADDED useEffect
import { Button } from '@/components/ui/button'; 
import { Mail } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { InvitationDialog } from '@/components/invitation-dialog';

interface Props {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  text?: string;
  icon?: boolean;
}

export function GetInvitationButton({ 
  className = "", 
  variant = "default", 
  text = "سجل معنا الآن",
  icon = true
}: Props) {
  
  const [open, setOpen] = useState(false);
  // Destructure isLoaded to ensure we run logic only when user status is known
  const { isSignedIn, isLoaded } = useUser(); 

  const handleClick = () => {
    if (!isSignedIn) {
      // --- TRIGGER: Append the 'open_invitation' flag to the return URL ---
      const mainAppUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL;
      
      // Get the current full URL (including any existing query params)
      const currentFullUrl = window.location.href;
      
      // Create the final return URL, appending our trigger flag
      const returnUrlWithFlag = currentFullUrl + (currentFullUrl.includes('?') ? '&' : '?') + 'open_invitation=true';
      
      if (mainAppUrl) {
        // Redirect to Sign In, passing the URL with our flag
        window.location.href = `${mainAppUrl}/sign-in?redirect_url=${encodeURIComponent(returnUrlWithFlag)}`;
      } else {
        console.error("NEXT_PUBLIC_MAIN_APP_URL is missing in .env");
      }
    } else {
      // Logic: Open Dialog if authenticated
      setOpen(true);
    }
  };

  // --- LISTENER: Check for the flag on page load ---
  useEffect(() => {
    // Only run this logic once the user status is loaded (after Clerk redirect)
    if (!isLoaded || !window.location.search) return;

    const urlParams = new URLSearchParams(window.location.search);
    const shouldOpen = urlParams.get('open_invitation');

    if (isSignedIn && shouldOpen === 'true') {
      setOpen(true);

      // Optional Cleanup: Remove the flag from the URL for a cleaner look
      urlParams.delete('open_invitation');
      window.history.replaceState({}, document.title, `${window.location.pathname}?${urlParams.toString()}`);
    }
  }, [isLoaded, isSignedIn]); // Re-runs on load and after authentication completes

  return (
    <>
      <Button 
        onClick={handleClick}
        variant={variant}
        className={className}
        dir="rtl"
      >
        {icon && <Mail className="h-4 w-4 ml-2" />}
        {text}
      </Button>

      <InvitationDialog open={open} onOpenChange={setOpen} />
    </>
  );
}