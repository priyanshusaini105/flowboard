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
      className="status-menu absolute z-50 bg-popover border border-border rounded-lg shadow-lg p-1 min-w-[140px]"
      style={{ left: anchorRect.left, top: anchorRect.bottom + 5 }}
    >
      {AVAILABLE_STATUSES.map((status) => (
        <button
          key={status.value}
          className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-accent text-popover-foreground flex items-center gap-2"
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
