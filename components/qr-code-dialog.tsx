'use client';

import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QRCodeDialog({ open, onOpenChange }: QRCodeDialogProps) {
  const { user } = useUser();
  const qrRef = useRef<HTMLDivElement>(null);

  const qrData = JSON.stringify({
    userId: user?.id,
    email: user?.emailAddresses[0]?.emailAddress,
    name: user?.fullName || user?.firstName,
    timestamp: Date.now(),
  });

  const handleDownload = async () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    // Clone the SVG to avoid modifying the original
    const svgClone = svg.cloneNode(true) as SVGElement;
    const svgData = new XMLSerializer().serializeToString(svgClone);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Increase size for better quality
    const size = 512;
    canvas.width = size;
    canvas.height = size;

    const img = new Image();
    
    img.onload = () => {
      // Draw white background
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);
        
        // Draw the QR code
        ctx.drawImage(img, 0, 0, size, size);
        
        // Load and draw the Google logo on top
        const logo = new Image();
        logo.crossOrigin = 'anonymous';
        logo.onload = () => {
          const logoSize = size * 0.2; // 20% of QR code size
          const logoX = (size - logoSize) / 2;
          const logoY = (size - logoSize) / 2;
          
          // Draw white circle background for logo
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, logoSize / 2 + 8, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw the logo
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
          
          // Convert to blob and download
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `gdg-qr-${user?.firstName || 'attendance'}.png`;
              link.click();
              URL.revokeObjectURL(url);
            }
          }, 'image/png', 1.0);
        };
        
        logo.onerror = () => {
          // If logo fails to load, just download without it
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `gdg-qr-${user?.firstName || 'attendance'}.png`;
              link.click();
              URL.revokeObjectURL(url);
            }
          }, 'image/png', 1.0);
        };
        
        logo.src = '/images/gdg-logo.png';
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

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
            <div ref={qrRef} className="relative bg-white p-6 rounded-lg shadow-lg">
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

          <Button
            onClick={handleDownload}
            className="w-full bg-[#4285F4] hover:bg-[#357AE8] text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            تحميل رمز الاستجابة السريعة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
