-- AlterTable
ALTER TABLE "states" ADD COLUMN     "totalLgas" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalSchools" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalUsers" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "stateId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "stateId" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE SET NULL ON UPDATE CASCADE;
