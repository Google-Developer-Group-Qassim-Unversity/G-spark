'use client';

import { useState } from 'react';
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
  const { isSignedIn } = useUser();

  const handleClick = () => {
    if (!isSignedIn) {
      // Logic: Redirect to Sign In if not authenticated
      const mainAppUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL;
      const currentUrl = window.location.origin;
      
      if (mainAppUrl) {
        window.location.href = `${mainAppUrl}/sign-in?redirect_url=${encodeURIComponent(currentUrl)}`;
      } else {
        console.error("NEXT_PUBLIC_MAIN_APP_URL is missing in .env");
      }
    } else {
      // Logic: Open Dialog if authenticated
      setOpen(true);
    }
  };

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