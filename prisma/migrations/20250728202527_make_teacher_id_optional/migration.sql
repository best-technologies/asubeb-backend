-- DropForeignKey
ALTER TABLE "assessments" DROP CONSTRAINT "assessments_teacherId_fkey";

-- AlterTable
ALTER TABLE "assessments" ALTER COLUMN "teacherId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
