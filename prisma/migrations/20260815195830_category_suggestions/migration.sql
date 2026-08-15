-- CreateEnum
CREATE TYPE "CategoryStatus" AS ENUM ('PENDING', 'APPROVED');

-- AlterTable: existing categories were all admin-curated, so they stay
-- approved by default.
ALTER TABLE "Category" ADD COLUMN "status" "CategoryStatus" NOT NULL DEFAULT 'APPROVED';
ALTER TABLE "Category" ADD COLUMN "suggestedById" TEXT;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_suggestedById_fkey" FOREIGN KEY ("suggestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Category_status_idx" ON "Category"("status");
