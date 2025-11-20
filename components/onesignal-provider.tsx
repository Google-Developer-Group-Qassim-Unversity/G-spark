"use client";

import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

const ONESIGNAL_APP_ID = "40436e0d-647a-4d57-8c3a-d4f71c4cdc54";

export function OneSignalProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize OneSignal only on the client side
    if (typeof window !== 'undefined') {
      // Suppress "No subscription" errors in console (normal before user subscribes)
      const originalError = console.error;
      console.error = (...args) => {
        if (args[0]?.includes?.('No subscription') || 
            args[0]?.message?.includes?.('No subscription')) {
          return; // Suppress these specific errors
        }
        originalError.apply(console, args);
      };

      OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true, // For local development
        // Custom link prompt is configured in the OneSignal dashboard
        // No need to enable notifyButton here since we're using custom UI
      }).then(() => {
        console.log('[OneSignal] Initialized successfully');
      }).catch((error) => {
        console.error('[OneSignal] Initialization error:', error);
      });
    }
  }, []);

  return <>{children}</>;
}
