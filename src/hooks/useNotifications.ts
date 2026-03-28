'use client';

import { useState, useCallback, useRef } from 'react';
import type { Notification, NotificationType } from '@/types';

let nextId = 0;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const keyToId = useRef<Map<string, string>>(new Map());
  const idToKey = useRef<Map<string, string>>(new Map());

  const removeNotification = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }

    const key = idToKey.current.get(id);
    if (key) {
      idToKey.current.delete(id);
      keyToId.current.delete(key);
    }

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback(
    (message: string, type: NotificationType = 'info') => {
      const key = `${type}:${message}`;
      const existingId = keyToId.current.get(key);

      if (existingId) {
        const existingTimer = timers.current.get(existingId);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        const refreshedTimer = setTimeout(() => {
          removeNotification(existingId);
        }, 3000);

        timers.current.set(existingId, refreshedTimer);
        return existingId;
      }

      const id = String(++nextId);
      const notification: Notification = { id, message, type };
      setNotifications((prev) => [...prev, notification]);

      keyToId.current.set(key, id);
      idToKey.current.set(id, key);

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
