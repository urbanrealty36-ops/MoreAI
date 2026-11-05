import { useEffect, useState, useSyncExternalStore } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const emptySubscribe = () => () => {};

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isInstalled = useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia('(display-mode: standalone)');
      mql.addEventListener('change', callback);
      window.addEventListener('appinstalled', callback);
      return () => {
        mql.removeEventListener('change', callback);
        window.removeEventListener('appinstalled', callback);
      };
    },
    () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true
      );
    },
    () => false
  );

  const isIOS = useSyncExternalStore(
    emptySubscribe,
    () => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()),
    () => false
  );

  const isOnline = useSyncExternalStore(
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    () => (typeof navigator !== 'undefined' ? navigator.onLine : true),
    () => true
  );

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    isOnline,
    install,
    mounted,
  };
}
