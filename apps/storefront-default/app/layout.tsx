import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body style={{ fontFamily: 'sans-serif', margin: 0, background: '#ffffff', color: '#111827' }}>
        {children}
      </body>
    </html>
  );
}
