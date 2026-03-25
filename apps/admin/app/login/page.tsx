import { loginAdminAction } from '../actions';

const errorMap: Record<string, string> = {
  INVALID_CREDENTIALS: 'Sai email hoặc mật khẩu.',
  UNAUTHORIZED: 'Cần đăng nhập admin.',
  INVALID_CSRF: 'CSRF token không hợp lệ.',
  RATE_LIMITED: 'Thử lại sau ít phút.',
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const message = params.error ? errorMap[params.error] ?? params.error : null;

  return (
    <main style={{ padding: 24, maxWidth: 420, margin: '0 auto' }}>
      <h1>Admin login</h1>
      {message ? <p style={{ color: 'crimson' }}>{message}</p> : null}
      <p>Lấy CSRF token qua API `/api/admin/csrf` trước khi submit form/server-action.</p>
      <form action={loginAdminAction} style={{ display: 'grid', gap: 12 }}>
        <input name="csrfToken" placeholder="CSRF token" required />
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        <button type="submit">Đăng nhập</button>
      </form>
    </main>
  );
}
