'use client';

import type { ThemeMode } from '@/types';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="rt:p-2 rt:rounded-md rt:hover:bg-zinc-800 rt:text-zinc-400 rt:hover:text-zinc-200 rt:transition-colors"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'} />
    </button>
  );
}
