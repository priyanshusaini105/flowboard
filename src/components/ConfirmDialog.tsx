'use client';

import { useCallback } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  variant?: 'alert' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  variant = 'alert',
  confirmText = 'Continue',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    },
    [onCancel]
  );

  if (!open) return null;

  return (
    <div
      className="rt:fixed rt:inset-0 rt:z-[120] rt:bg-black/60 rt:backdrop-blur-sm rt:flex rt:items-center rt:justify-center rt:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="rt:w-full rt:max-w-md rt:rounded-xl rt:border rt:border-zinc-700 rt:bg-zinc-900 rt:shadow-2xl rt:p-5">
        <h3 className="rt:text-lg rt:font-semibold rt:text-zinc-100">{title}</h3>
        <p className="rt:mt-2 rt:text-sm rt:text-zinc-300 rt:leading-relaxed">{description}</p>
        <div className="rt:mt-5 rt:flex rt:items-center rt:justify-end rt:gap-2">
          {variant === 'confirm' && (
            <button
              type="button"
              className="rt:inline-flex rt:items-center rt:justify-center rt:rounded-md rt:border rt:border-zinc-600 rt:bg-zinc-800 rt:px-3 rt:py-2 rt:text-sm rt:font-medium rt:text-zinc-200 rt:hover:bg-zinc-700"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            className="rt:inline-flex rt:items-center rt:justify-center rt:rounded-md rt:bg-blue-600 rt:px-3 rt:py-2 rt:text-sm rt:font-medium rt:text-white rt:hover:bg-blue-700"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
