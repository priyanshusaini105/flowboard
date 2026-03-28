'use client';

import { useEffect, useRef } from 'react';
import { AVAILABLE_STATUSES } from '@/lib/kanbanData';

interface StatusMenuProps {
  taskId: string;
  anchorRect: DOMRect;
  onSelect: (taskId: string, status: string | null) => void;
  onClose: () => void;
}

export default function StatusMenu({ taskId, anchorRect, onSelect, onClose }: StatusMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    const timer = setTimeout(() => document.addEventListener('click', handleClick), 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClick);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="status-menu rt:absolute rt:z-50 rt:bg-zinc-800 rt:border rt:border-zinc-700 rt:rounded-lg rt:shadow-lg rt:p-1 rt:min-w-[120px]"
      style={{ left: anchorRect.left, top: anchorRect.bottom + 5 }}
    >
      {AVAILABLE_STATUSES.map((status) => (
        <button
          key={status.value}
          className="rt:w-full rt:text-left rt:px-2 rt:py-1.5 rt:text-xs rt:rounded rt:hover:bg-zinc-700 rt:text-zinc-300 rt:flex rt:items-center rt:gap-2"
          onClick={() => {
            onSelect(taskId, status.value || null);
            onClose();
          }}
        >
          {status.icon && <i className={status.icon} />}
          <span>{status.label}</span>
        </button>
      ))}
    </div>
  );
}
