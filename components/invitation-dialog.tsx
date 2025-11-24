'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface InvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InvitationStatus {
  formId?: string;
  alreadySubmitted: boolean;
}

export function InvitationDialog({ open, onOpenChange }: InvitationDialogProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [invitationStatus, setInvitationStatus] = useState<InvitationStatus | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check invitation status when dialog opens
  useEffect(() => {
    const checkInvitationStatus = async () => {
      if (!user || !open) return;
      
      setCheckingStatus(true);
      setError(null);
      
      try {
        const eventId = '246';
        
        // Get Clerk session token from cookie
        const sessionToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('__session='))
          ?.split('=')[1];

        const response = await fetch(`http://API_ENDPOINT_IP/events/${eventId}/form`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('فشل في التحقق من حالة الطلب');
        }

        const data = await response.json();
        console.log('Form data received:', data);
        setInvitationStatus({
          formId: data.id || data.formId,
          alreadySubmitted: data.alreadySubmitted || false,
        });
        
      } catch (err) {
        console.error('Error checking invitation status:', err);
        setError('حدث خطأ أثناء التحقق من حالة الطلب. يرجى المحاولة مرة أخرى.');
      } finally {
        setCheckingStatus(false);
      }
    };

    if (open) {
      checkInvitationStatus();
    }
  }, [user, open]);

  const handleSubmitInvitation = async () => {
    if (!user || !invitationStatus?.formId) return;

    setLoading(true);
    setError(null);

    try {
      // Get Clerk session token from cookie
      const sessionToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('__session='))
        ?.split('=')[1];

      const response = await fetch('http://API_ENDPOINT_IP/forms/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          formId: invitationStatus.formId,
          token: user.id, // Use user ID as token
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل إرسال الطلب. يرجى المحاولة مرة أخرى.');
      }

      setSubmitSuccess(true);
      
    } catch (err) {
      console.error('Error submitting invitation:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    // Loading state while checking status
    if (checkingStatus) {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#4285F4]" />
          <p className="text-gray-600 text-center">جارٍ التحقق من حالة الطلب...</p>
        </div>
      );
    }

    // Error state
    if (error && !invitationStatus) {
      return (
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <div className="w-full px-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm text-center">
              {error}
            </div>
          </div>
          <Button
            onClick={() => {
              setError(null);
              setCheckingStatus(true);
              // Retry
              if (user && open) {
                const eventId = '246';
                const sessionToken = document.cookie
                  .split('; ')
                  .find(row => row.startsWith('__session='))
                  ?.split('=')[1];

                fetch(`http://API_ENDPOINT_IP/events/${eventId}/form`, {
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`,
                  },
                })
                  .then(res => res.json())
                  .then(data => {
                    console.log('Form data received:', data);
                    setInvitationStatus({
                      formId: data.id || data.formId,
                      alreadySubmitted: data.alreadySubmitted || false,
                    });
                    setCheckingStatus(false);
                  })
                  .catch(() => {
                    setError('حدث خطأ أثناء التحقق من حالة الطلب');
                    setCheckingStatus(false);
                  });
              }
            }}
            variant="outline"
            className="border-[#4285F4] text-[#4285F4]"
          >
            إعادة المحاولة
          </Button>
        </div>
      );
    }

    // Success message after submission
    if (submitSuccess) {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-6">
          <CheckCircle2 className="h-20 w-20 text-[#34A853]" />
          <p className="text-center text-gray-800 leading-relaxed px-6 text-lg">
            تم إرسال طلب الدعوة بنجاح! ستصلك رسالة عبر البريد الإلكتروني قريبًا تحتوي على بطاقة الدعوة.
          </p>
        </div>
      );
    }

    // Already submitted message
    if (invitationStatus?.alreadySubmitted) {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-6">
          <CheckCircle2 className="h-20 w-20 text-[#4285F4]" />
          <p className="text-center text-gray-800 leading-relaxed px-6 text-lg">
            لقد تم إرسال طلبك مسبقًا. ستصلك رسالة عبر البريد الإلكتروني قريبًا تحتوي على بطاقة الدعوة الخاصة بالفعالية.
          </p>
        </div>
      );
    }

    // New request form
    return (
      <div className="flex flex-col items-center gap-8 py-8">
        <p className="text-center text-gray-700 leading-relaxed px-6 text-base">
          اضغط على الزر أدناه لإرسال طلب الحصول على دعوة لحضور الفعالية
        </p>

        {error && (
          <div className="w-full px-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm text-center">
              {error}
            </div>
          </div>
        )}

        <Button
          onClick={handleSubmitInvitation}
          disabled={loading}
          className="w-full max-w-sm bg-[#4285F4] hover:bg-[#357AE8] text-white font-bold text-lg px-8 py-7 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {loading ? (
            <>
              <Loader2 className="ml-2 h-6 w-6 animate-spin" />
              جارٍ الإرسال...
            </>
          ) : (
            'ارسال طلب دعوة للحفل'
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center px-6 max-w-md">
          سيتم مراجعة طلبك وإرسال بطاقة الدعوة عبر البريد الإلكتروني المسجل
        </p>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-[#242E48]" dir="rtl">
            طلب دعوة الحضور
          </DialogTitle>
        </DialogHeader>
        <div dir="rtl">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
