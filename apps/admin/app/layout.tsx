import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '../lib/session';
import { logoutAdminAction } from './actions';

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();

  return (
    <html lang="vi">
      <body style={{ fontFamily: 'sans-serif', margin: 0, background: '#fafafa', color: '#111827' }}>
        {session ? (
          <header style={{ padding: 16, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
            <strong>Admin</strong>
            <form action={logoutAdminAction}>
              <button type="submit">Đăng xuất</button>
            </form>
          </header>
        ) : null}
        {children}
      </body>
    </html>
  );
}
