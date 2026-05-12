import { api, env } from "@/features/common";
import {
  NotificationContext,
  PermissionState,
} from "@/features/notification/hooks/use-notification";
import { getApp, getApps } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
} from "firebase/messaging";
import { useCallback, useEffect, useState } from "react";

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [permissionState, setPermissionState] = useState<PermissionState>(
    () => {
      if (typeof Notification === "undefined") return "denied";
      return Notification.permission;
    },
  );
  const [isRegistered, setIsRegistered] = useState(false);

  const [messaging, setMessaging] = useState<Messaging | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!("serviceWorker" in navigator)) return;
    if (typeof Notification === "undefined") return;

    isSupported()
      .then((supported) => {
        if (!supported || cancelled) return;
        if (getApps().length === 0) return;
        const app = getApp();
        const instance = getMessaging(app);
        if (!cancelled) setMessaging(instance);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof Notification === "undefined") return;
    if (!messaging || Notification.permission !== "granted") return;
    navigator.serviceWorker.ready
      .then((registration) =>
        getToken(messaging, {
          vapidKey: env.VITE_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        }),
      )
      .then((token) => {
        if (token) setIsRegistered(true);
      })
      .catch(() => {});
  }, [messaging]);

  useEffect(() => {
    if (!messaging) return;
    return onMessage(messaging, (payload) => {
      const title = payload.notification?.title;
      const body = payload.notification?.body;
      const url = payload.data?.url;
      if (!title || typeof Notification === "undefined") return;
      if (Notification.permission !== "granted") return;

      const notification = new Notification(title, {
        body,
        icon: "/icons/icon-192x192.png",
      });
      if (url) {
        notification.onclick = () => window.open(url, "_blank");
      }
    });
  }, [messaging]);

  const register = useCallback(async (): Promise<boolean> => {
    if (permissionState === "denied" || permissionState === "requesting")
      return false;
    if (!messaging) return false;

    if (typeof Notification === "undefined") return false;

    let permission = Notification.permission;

    if (permission === "default") {
      setPermissionState("requesting");
      permission = await Notification.requestPermission();
      setPermissionState(permission);
    }

    if (permission !== "granted") return false;

    const registration = await navigator.serviceWorker.ready;
    const token = await getToken(messaging, {
      vapidKey: env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    await api.notification.token.post({ token });
    setIsRegistered(true);

    return true;
  }, [messaging, permissionState]);

  return (
    <NotificationContext.Provider
      value={{ isRegistered, permissionState, register }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
