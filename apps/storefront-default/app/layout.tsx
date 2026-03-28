import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
        <title>삼양 서브큐몰 | 신뢰와 속도의 식자재 플랫폼</title>
      </head>
      <body
        style={{
          fontFamily: 'Pretendard, system-ui, sans-serif',
          margin: 0,
          background: '#f5f6f8',
          color: '#111827',
        }}
      >
        {children}
      </body>
    </html>
  );
}
