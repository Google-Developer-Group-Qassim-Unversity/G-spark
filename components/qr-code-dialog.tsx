'use client';

import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUser } from '@clerk/nextjs';

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QRCodeDialog({ open, onOpenChange }: QRCodeDialogProps) {
  const { user } = useUser();

  const qrData = JSON.stringify({
    userId: user?.id,
    email: user?.emailAddresses[0]?.emailAddress,
    name: user?.fullName || user?.firstName,
    timestamp: Date.now(),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-[#242E48]">
            رمز الحضور الخاص بك
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="relative">
            <div className="absolute inset-0 bg-[#4285F4]/20 rounded-lg blur-xl" />
            <div className="relative bg-white p-6 rounded-lg shadow-lg">
              <QRCodeSVG
                value={qrData}
                size={256}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: '/images/gdg-logo.png',
                  height: 48,
                  width: 48,
                  excavate: true,
                }}
              />
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-gray-600 text-sm" dir="rtl">
              قم بإظهار هذا الرمز للمنظمين عند الدخول
            </p>
            <p className="text-[#242E48] font-semibold">
              {user?.fullName || user?.firstName}
            </p>
            <p className="text-gray-500 text-sm">
              {user?.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
