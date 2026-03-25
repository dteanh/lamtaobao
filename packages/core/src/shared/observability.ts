import { prisma } from '@culi/db';

export function logEvent(event: string, payload: Record<string, unknown>) {
  const line = JSON.stringify({ ts: new Date().toISOString(), event, ...payload });
  console.log(line);
}

export async function incrementMetric(key: string, by = 1) {
  await prisma.metricCounter.upsert({
    where: { key },
    update: { value: { increment: by } },
    create: { key, value: by },
  });
}
