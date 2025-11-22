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
import { Download, QrCode } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { AuthButton } from '@/components/auth-button';

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QRCodeDialog({ open, onOpenChange }: QRCodeDialogProps) {
  const { isSignedIn, user } = useUser();
  const qrRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  const qrData = JSON.stringify({
    userId: user?.id,
    email: user?.emailAddresses[0]?.emailAddress,
    name: user?.fullName || user?.firstName,
    timestamp: Date.now(),
  });

  const handleDownload = async () => {
    const badgeContainer = badgeRef.current;
    if (!badgeContainer) return;

    const badgeImg = document.createElement('img');
    badgeImg.crossOrigin = 'anonymous';
    
    badgeImg.onload = () => {
      // Use the actual image dimensions to avoid stretching
      const badgeWidth = badgeImg.naturalWidth;
      const badgeHeight = badgeImg.naturalHeight;
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = badgeWidth;
      canvas.height = badgeHeight;

      if (!ctx) return;

      // Draw the badge background at original size
      ctx.drawImage(badgeImg, 0, 0, badgeWidth, badgeHeight);
      
      const svg = qrRef.current?.querySelector('svg');
      if (!svg) return;

      // Load the GDG logo first to embed it in the QR code
      const logoImg = document.createElement('img');
      logoImg.crossOrigin = 'anonymous';
      
      logoImg.onload = () => {
        const svgClone = svg.cloneNode(true) as SVGElement;
        
        // Convert logo to base64 and embed it in the SVG with higher resolution
        const logoCanvas = document.createElement('canvas');
        const logoCtx = logoCanvas.getContext('2d');
        // Use 4x size for better quality when scaled
        const logoSize = 128;
        logoCanvas.width = logoSize;
        logoCanvas.height = logoSize;
        
        if (logoCtx) {
          // Enable image smoothing for better quality
          logoCtx.imageSmoothingEnabled = true;
          logoCtx.imageSmoothingQuality = 'high';
          logoCtx.drawImage(logoImg, 0, 0, logoSize, logoSize);
          const logoDataUrl = logoCanvas.toDataURL('image/png');
          
          // Replace the logo src in the SVG with the data URL
          const imageElements = svgClone.querySelectorAll('image');
          imageElements.forEach(img => {
            img.setAttribute('href', logoDataUrl);
          });
        }
        
        const svgData = new XMLSerializer().serializeToString(svgClone);
        
        const qrImg = document.createElement('img');
        qrImg.onload = () => {
          // QR code positioning - centered on the badge
          const qrSize = Math.min(badgeWidth, badgeHeight) * 0.4; // 40% of smaller dimension
          const qrX = (badgeWidth - qrSize) / 2;
          const qrY = (badgeHeight - qrSize) / 2 - 100; // Centered vertically with slight upward adjustment
          
          // Draw the QR code
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
          
          // Convert to blob and download
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `gspark-badge-${user?.firstName || 'attendee'}.png`;
              link.click();
              URL.revokeObjectURL(url);
            }
          }, 'image/png', 1.0);
        };

        qrImg.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
      };
      
      logoImg.onerror = () => {
        // If logo fails to load, proceed without it
        const svgClone = svg.cloneNode(true) as SVGElement;
        const svgData = new XMLSerializer().serializeToString(svgClone);
        
        const qrImg = document.createElement('img');
        qrImg.onload = () => {
          const qrSize = Math.min(badgeWidth, badgeHeight) * 0.4;
          const qrX = (badgeWidth - qrSize) / 2;
          const qrY = (badgeHeight - qrSize) / 2 - 100;
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `gspark-badge-${user?.firstName || 'attendee'}.png`;
              link.click();
              URL.revokeObjectURL(url);
            }
          }, 'image/png', 1.0);
        };
        qrImg.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
      };
      
      logoImg.src = '/images/gdg-logo.png';
    };

    badgeImg.onerror = () => {
      console.error('Failed to load badge image');
      handleSimpleQRDownload();
    };

    badgeImg.src = '/images/event-badge.png';
  };

  const handleSimpleQRDownload = async () => {
    // Fallback to original simple QR download
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgClone = svg.cloneNode(true) as SVGElement;
    const svgData = new XMLSerializer().serializeToString(svgClone);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 512;
    canvas.width = size;
    canvas.height = size;

    const img = document.createElement('img');
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        
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
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Show sign-in prompt if user is not authenticated
  if (!isSignedIn) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-[#242E48]" dir="rtl">
              احصل على بطاقة دعوة
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-6 px-4">
            {/* Illustration or Icon */}
            <div className="relative w-32 h-32 rounded-full bg-linear-to-br from-[#4285F4]/20 via-[#EA4335]/20 to-[#FBBC05]/20 flex items-center justify-center">
              <QrCode className="w-16 h-16 text-[#4285F4]" />
            </div>

            {/* Message */}
            <div className="text-center space-y-3" dir="rtl">
              <h3 className="text-xl font-bold text-[#242E48]">
                سجل الدخول للحصول على بطاقتك
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                 سجّل دخول أو أنشئ حساب جديد عشان تاخذ بطاقة دعوة خاصة بك مع رمز QR فريد
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full">
              <AuthButton type="signin" />
              <AuthButton type="signup" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Original authenticated user content
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-[#242E48]" dir="rtl">
            بطاقة الحضور الخاصة بك
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-4">
          {/* Badge Preview */}
          <div ref={badgeRef} className="relative w-full max-w-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4285F4]/20 via-[#EA4335]/20 to-[#FBBC05]/20 rounded-2xl blur-2xl" />
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Badge Background */}
              <div className="relative aspect-[9/16] w-full">
                <Image
                  src="/images/event-badge.png"
                  alt="Event Badge"
                  fill
                  className="object-cover"
                  priority
                />
                
                {/* QR Code Overlay - centered on the badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center mt-0">
                  {/* Raw QR code without white background */}
                  <div ref={qrRef} className="shadow-lg">
                    <QRCodeSVG
                      value={qrData}
                      size={160}
                      level="H"
                      includeMargin={false}
                      imageSettings={{
                        src: '/images/gdg-logo.png',
                        height: 32,
                        width: 32,
                        excavate: true,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center space-y-2 px-4" dir="rtl">
            <p className="text-gray-600 text-sm">
              قم بإظهار هذه البطاقة للمنظمين عند الدخول
            </p>
            <p className="text-xs text-gray-500">
              يمكنك حفظ البطاقة على هاتفك أو طباعتها
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm px-4">
            <Button
              onClick={handleDownload}
              className="w-full bg-[#4285F4] hover:bg-[#357AE8] text-white shadow-lg"
            >
              <Download className="w-4 h-4 mr-2" />
              تحميل البطاقة
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
