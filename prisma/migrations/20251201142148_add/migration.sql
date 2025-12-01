-- DropIndex
DROP INDEX "sessions_name_key";

-- DropIndex
DROP INDEX "terms_sessionId_name_key";

-- AlterTable
ALTER TABLE "subeb_officers" ADD COLUMN     "enrolledBy" TEXT;

-- AddForeignKey
ALTER TABLE "subeb_officers" ADD CONSTRAINT "subeb_officers_enrolledBy_fkey" FOREIGN KEY ("enrolledBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
