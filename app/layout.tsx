import type { Metadata } from 'next';
import '../src/styles.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Kanban Board',
  description: 'Kanban Board - Frontend Assignment',
};

// Inline script runs synchronously before React hydrates, reading localStorage
// to set data-theme. This ensures server HTML (data-theme="dark") matches the
// initial client render, eliminating the DaisyUI filter:invert hydration mismatch.
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('kanban-theme-mode');
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
      if (t === 'dark') document.documentElement.classList.add('rt:dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('rt:dark');
    }
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('rt:dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
