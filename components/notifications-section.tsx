'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BellIcon, CheckCircle2Icon, AlertCircleIcon, SmartphoneIcon } from 'lucide-react';
import { initOneSignal, subscribeToNotifications, getNotificationPermission, isIOS } from '@/lib/onesignal';

export function NotificationsSection() {
  const [permission, setPermission] = useState<string>('default');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    initOneSignal();
    
    const checkPermission = async () => {
      const perm = await getNotificationPermission();
      setPermission(perm);
    };
    
    checkPermission();
    const interval = setInterval(checkPermission, 1000);
    
    setShowIOSInstructions(isIOS());
    
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      await subscribeToNotifications();
      const newPermission = await getNotificationPermission();
      setPermission(newPermission);
    } catch (error) {
      console.error('[v0] Subscription failed:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <section id="notifications" className="min-h-screen flex items-center justify-center py-20 bg-gradient-to-br from-[var(--gspark-dark)] to-[var(--gspark-blue)]">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto glass border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <BellIcon className="h-16 w-16 text-[var(--gspark-blue)]" />
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold text-white mb-2">
              Enable Notifications
            </CardTitle>
            <CardDescription className="text-lg text-white/80" style={{ direction: 'rtl' }}>
              فعل الاشعارات للحصول على التحديثات
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Status */}
            <Alert className={`${
              permission === 'granted' 
                ? 'bg-[var(--gspark-green)]/20 border-[var(--gspark-green)]' 
                : 'bg-white/10 border-white/20'
            }`}>
              <div className="flex items-center gap-3">
                {permission === 'granted' ? (
                  <CheckCircle2Icon className="h-5 w-5 text-[var(--gspark-green)]" />
                ) : (
                  <AlertCircleIcon className="h-5 w-5 text-[var(--gspark-yellow)]" />
                )}
                <AlertDescription className="text-white font-medium">
                  {permission === 'granted' 
                    ? '✅ Notifications are enabled!' 
                    : '⚠️ Notifications are not enabled'}
                </AlertDescription>
              </div>
            </Alert>

            {/* Subscribe Button */}
            {permission !== 'granted' && (
              <Button
                size="lg"
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className="w-full bg-[var(--gspark-blue)] hover:bg-[var(--gspark-blue)]/90 text-white font-bold text-lg py-6 rounded-xl shadow-lg"
              >
                {isSubscribing ? 'Subscribing...' : 'Enable Push Notifications'}
              </Button>
            )}

            {/* iOS Instructions */}
            {showIOSInstructions && (
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <SmartphoneIcon className="h-5 w-5 text-[var(--gspark-yellow)]" />
                    <CardTitle className="text-lg text-white">
                      iPhone Users
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-white/80 text-sm space-y-2">
                  <p className="font-semibold text-white">To enable notifications on iPhone:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Tap the <strong>Share</strong> button (square with arrow)</li>
                    <li>Scroll down and select <strong>{"Add to Home Screen"}</strong></li>
                    <li>Tap <strong>Add</strong> in the top right</li>
                    <li>Open the app from your home screen</li>
                    <li>Allow notifications when prompted</li>
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* Info */}
            <div className="text-center text-white/70 text-sm">
              <p>
                {"You'll"} receive updates about the conference schedule, announcements, and winner results.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
