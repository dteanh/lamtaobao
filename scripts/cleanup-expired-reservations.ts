import { cleanupExpiredReservations } from '../packages/core/src/cart/repository';
import { incrementMetric, logEvent } from '../packages/core/src/shared/observability';

async function main() {
  const cleaned = await cleanupExpiredReservations();
  await incrementMetric('reservation_cleanup_runs_total');
  logEvent('reservation_cleanup_completed', { cleaned });
  console.log(JSON.stringify({ cleaned }));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
