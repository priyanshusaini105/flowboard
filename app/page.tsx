'use client';

import { Suspense } from 'react';
import Board from '@/components/Board';

export default function Home() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <Board />
    </Suspense>
  );
}
