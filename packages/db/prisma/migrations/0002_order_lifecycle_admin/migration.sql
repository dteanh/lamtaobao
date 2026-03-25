ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELED');
ALTER TABLE "Order"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "OrderStatus"
  USING (
    CASE
      WHEN "status"::text = 'PAID' THEN 'CONFIRMED'::"OrderStatus"
      WHEN "status"::text = 'CANCELLED' THEN 'CANCELED'::"OrderStatus"
      ELSE "status"::text::"OrderStatus"
    END
  ),
  ALTER COLUMN "status" SET DEFAULT 'PENDING';
DROP TYPE "OrderStatus_old";
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "internalNote" TEXT;
