-- CreateEnum
CREATE TYPE "RatingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable: add nullable categoryId first so we can backfill existing rows
ALTER TABLE "Rating" ADD COLUMN "categoryId" TEXT;

-- Backfill: use the first category of the rated profile (existing ratings
-- predate per-category reviews, so there is no way to know which service
-- was actually reviewed — this is the best available approximation).
UPDATE "Rating" r
SET "categoryId" = (
  SELECT pc."categoryId"
  FROM "ProfileCategory" pc
  WHERE pc."providerProfileId" = r."providerProfileId"
  ORDER BY pc."categoryId"
  LIMIT 1
)
WHERE r."categoryId" IS NULL;

-- Make categoryId required now that existing rows are backfilled
ALTER TABLE "Rating" ALTER COLUMN "categoryId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: add moderation status, defaulting new rows to PENDING
ALTER TABLE "Rating" ADD COLUMN "status" "RatingStatus" NOT NULL DEFAULT 'PENDING';

-- Backfill: ratings that existed before moderation was introduced were
-- already publicly visible, so grandfather them in as approved.
UPDATE "Rating" SET "status" = 'APPROVED';

-- Replace the old (providerProfileId, raterUserId) unique constraint with
-- one that also includes categoryId, so a member can rate each service a
-- provider offers separately.
DROP INDEX "Rating_providerProfileId_raterUserId_key";
CREATE UNIQUE INDEX "Rating_providerProfileId_categoryId_raterUserId_key" ON "Rating"("providerProfileId", "categoryId", "raterUserId");

-- CreateIndex
CREATE INDEX "Rating_categoryId_idx" ON "Rating"("categoryId");

-- CreateIndex
CREATE INDEX "Rating_status_idx" ON "Rating"("status");
