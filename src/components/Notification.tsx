'use client';

import type { Notification as NotificationType } from '@/types';

interface NotificationStackProps {
  notifications: NotificationType[];
  onRemove: (id: string) => void;
}

export default function NotificationStack({ notifications, onRemove }: NotificationStackProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`px-4 py-2 rounded-lg text-sm font-medium shadow-lg animate-[fadeInUp_0.3s_ease-out] flex items-center gap-2 ${
            n.type === 'success'
              ? 'bg-green-600 text-white'
              : n.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-blue-600 text-white'
          }`}
        >
          <i
            className={
              n.type === 'success'
                ? 'fas fa-check-circle'
                : n.type === 'error'
                  ? 'fas fa-exclamation-circle'
                  : 'fas fa-info-circle'
            }
          />
          <span>{n.message}</span>
          <button
            onClick={() => onRemove(n.id)}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            <i className="fas fa-times text-xs" />
          </button>
        </div>
      ))}
    </div>
  );
}
