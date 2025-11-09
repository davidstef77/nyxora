'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    const IS_PROD = typeof window !== 'undefined' && !/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      IS_PROD
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          if (!IS_PROD) {
            console.log('[SW] Service Worker registered successfully:', registration.scope);
          }
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  if (confirm('O versiune nouă este disponibilă. Reîncarcă pagina?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch(error => {
          console.error('[SW] Service Worker registration failed:', error);
        });

      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          window.location.reload();
        }
      });

      // Handle online/offline status
      const handleOnline = () => {
        if (!IS_PROD) {
          console.log('[SW] App is online');
        }
        // Optionally show notification
      };

      const handleOffline = () => {
        if (!IS_PROD) {
          console.log('[SW] App is offline');
        }
        // Optionally show notification
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return null; // This component doesn't render anything
}