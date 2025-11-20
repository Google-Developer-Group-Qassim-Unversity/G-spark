"use client";

interface OneSignalCustomPromptProps {
  isSubscribed?: boolean;
}

/**
 * OneSignal Custom Link Prompt Container
 * 
 * This component renders the container for OneSignal's custom link prompt.
 * The prompt is configured in the OneSignal dashboard under:
 * Settings > Prompt Configuration > Custom Link Prompt
 * 
 * OneSignal automatically injects the prompt content into this container
 * when the page loads.
 */
export function OneSignalCustomPrompt({ isSubscribed = false }: OneSignalCustomPromptProps) {
  return (
    <div 
      className={`onesignal-customlink-container ${isSubscribed ? 'subscribed' : ''}`}
      aria-label="OneSignal notification prompt"
    />
  );
}
