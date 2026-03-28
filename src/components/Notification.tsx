'use client';

import type { Notification as NotificationType } from '@/types';

interface NotificationStackProps {
  notifications: NotificationType[];
  onRemove: (id: string) => void;
}

export default function NotificationStack({ notifications, onRemove }: NotificationStackProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="rt:fixed rt:top-4 rt:right-4 rt:z-[200] rt:flex rt:flex-col rt:gap-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`rt:px-4 rt:py-2 rt:rounded-lg rt:text-sm rt:font-medium rt:shadow-lg rt:animate-[fadeInUp_0.3s_ease-out] rt:flex rt:items-center rt:gap-2 ${
            n.type === 'success'
              ? 'rt:bg-green-600 rt:text-white'
              : n.type === 'error'
                ? 'rt:bg-red-600 rt:text-white'
                : 'rt:bg-blue-600 rt:text-white'
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
            className="rt:ml-2 rt:opacity-70 rt:hover:opacity-100"
          >
            <i className="fas fa-times rt:text-xs" />
          </button>
        </div>
      ))}
    </div>
  );
}
