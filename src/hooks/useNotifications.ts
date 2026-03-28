'use client';

import { useState, useCallback, useRef } from 'react';
import type { Notification, NotificationType } from '@/types';

let nextId = 0;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeNotification = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback(
    (message: string, type: NotificationType = 'info') => {
      const id = String(++nextId);
      const notification: Notification = { id, message, type };
      setNotifications((prev) => [...prev, notification]);

      const timer = setTimeout(() => {
        removeNotification(id);
      }, 3000);
      timers.current.set(id, timer);

      return id;
    },
    [removeNotification]
  );

  return { notifications, showNotification, removeNotification };
}
