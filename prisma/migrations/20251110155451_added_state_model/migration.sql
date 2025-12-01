-- DropForeignKey
ALTER TABLE "local_government_areas" DROP CONSTRAINT "local_government_areas_stateId_fkey";

-- DropForeignKey
ALTER TABLE "schools" DROP CONSTRAINT "schools_stateId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_stateId_fkey";

-- DropForeignKey
ALTER TABLE "subeb_officers" DROP CONSTRAINT "subeb_officers_stateId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_stateId_fkey";

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local_government_areas" ADD CONSTRAINT "local_government_areas_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subeb_officers" ADD CONSTRAINT "subeb_officers_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
