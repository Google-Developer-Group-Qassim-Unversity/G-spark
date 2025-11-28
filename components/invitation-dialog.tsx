'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@clerk/nextjs'; 
import { Loader2, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_APP_API_URL; 
const EVENT_ID = process.env.GSPARK_EVENT_ID;

interface InvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvitationDialog({ open, onOpenChange }: InvitationDialogProps) {
  // --- 1. HOOKS ---
  const { user } = useUser();      // Still needed to check if logged in
  const { getToken } = useAuth();  // For the actual token string
  
  // --- 2. STATE ---
  const [viewState, setViewState] = useState<'loading' | 'form' | 'success' | 'already-submitted' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formId, setFormId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 3. GET FORM ID (Runs on Open) ---
  const checkStatus = useCallback(async () => {
    // Basic guard: If not logged in or dialog closed, do nothing
    if (!user || !open) return;
    
    setViewState('loading');
    
    try {
      const token = await getToken();

      const response = await fetch(`${API_BASE_URL}/events/${EVENT_ID}/form`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('فشل في الاتصال بالخادم');

      const data = await response.json();
      
      // Store the Form ID
      setFormId(data.formId || data.id);
      
      // Show the form immediately (we wait for the POST to check if already submitted)
      setViewState('form');
      
    } catch (err) {
      console.error(err);
      setErrorMessage('حدث خطأ أثناء تحميل البيانات');
      setViewState('error');
    }
  }, [user, open, getToken]);

  useEffect(() => {
    if (open) checkStatus();
  }, [open, checkStatus]);

  // --- 4. SUBMIT FORM (POST) ---
  const handleSubmit = async () => {
    if (!user || !formId) return;
    
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const token = await getToken();

      const response = await fetch(`${API_BASE_URL}/forms/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({
          formId: formId
        }),
      });

      // --- BACKEND RESPONSE HANDLING ---
      if (!response.ok) {
        const errorText = await response.text(); 
        
        // Check if C# Backend said "Member already submitted"
        if (response.status === 400 && errorText.includes("already submitted")) {
           setViewState('already-submitted');
           return;
        }

        // Generic error
        throw new Error('فشل إرسال الطلب');
      }

      setViewState('success');
      
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 5. RENDER UI ---
  const renderContent = () => {
    switch (viewState) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="mt-4 text-gray-600">لحظات...</p>
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <p className="text-red-600">{errorMessage}</p>
            <Button variant="outline" onClick={checkStatus}>حدث خطأ حاول مره ثانية 😞</Button>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center py-12 gap-6">
            <CheckCircle2 className="h-20 w-20 text-green-500" />
            <p className="text-center text-gray-800 text-lg">تم تسجيلك, لحظات وتجيك بطاقة الحضور على الايميل 🎉</p>
          </div>
        );

      case 'already-submitted':
        return (
          <div className="flex flex-col items-center justify-center py-12 gap-6">
            <CheckCircle2 className="h-20 w-20 text-blue-500" />
            <p className="text-center text-gray-800 text-lg">انت مسجل معنا من قبل شيك على ايميلك بتحصل البطاقة وصلتك ✨</p>
          </div>
        );

      case 'form':
        return (
          <div className="flex flex-col items-center gap-6 py-8">
            <p className="text-center text-gray-700">اضغط عشان تسجل وتجيك بطاقة الحضور 🎊</p>
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
            
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="w-full bg-black hover:bg-gray-800 text-white py-6 text-lg"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'تسجيل'}
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center">تسجيل في G-Spark </DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}