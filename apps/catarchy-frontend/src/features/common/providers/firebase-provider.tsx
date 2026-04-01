import { env } from "@/features/common/lib/env";
import { FirebaseOptions, getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, onMessage } from "firebase/messaging";
import { useEffect, useMemo } from "react";

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const options: FirebaseOptions = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };

  const messaging = useMemo(() => {
    const initializedApps = getApps();
    const app = initializedApps.length > 0 ? getApp() : initializeApp(options);

    return getMessaging(app);
  }, []);

  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      const { title, body } = payload.notification ?? {};
      if (title && Notification.permission === "granted") {
        new Notification(title, { body, icon: "/icons/icon-192x192.png" });
      }
    });
    return unsubscribe;
  }, []);

  return <>{children}</>;
}
