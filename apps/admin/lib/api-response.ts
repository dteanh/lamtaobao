import { NextResponse } from 'next/server';

export function apiOk(payload: Record<string, unknown>, init?: { status?: number }) {
  return NextResponse.json({ ok: true, ...payload }, { status: init?.status ?? 200 });
}

export function apiError(payload: { requestId: string; code: string; message?: string; details?: Record<string, unknown> }, init?: { status?: number }) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: payload.code,
        message: payload.message ?? payload.code,
        details: payload.details ?? null,
      },
      requestId: payload.requestId,
    },
    { status: init?.status ?? 400 },
  );
}
