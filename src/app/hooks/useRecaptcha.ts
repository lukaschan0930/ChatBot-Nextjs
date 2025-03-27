import { useEffect } from 'react';
import { RECAPTCHA_SITE_KEY } from '../lib/recaptcha';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export function useRecaptcha() {
  useEffect(() => {
    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const executeRecaptcha = async (action: string): Promise<string> => {
    try {
      return await window.grecaptcha.execute(RECAPTCHA_SITE_KEY as string, { action });
    } catch (error) {
      console.error('reCAPTCHA execution error:', error);
      throw error;
    }
  };

  return { executeRecaptcha };
} 