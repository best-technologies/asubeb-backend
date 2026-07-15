-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING_SUBMISSION', 'AWAITING_APPROVAL', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AcademicStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SCHOOL_IT';

-- AlterTable
ALTER TABLE "assessments" ADD COLUMN     "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING_SUBMISSION';

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "status" "AcademicStatus" NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "profilePicture" TEXT;

-- AlterTable
ALTER TABLE "subeb_officers" ADD COLUMN     "lgaId" TEXT;

-- AlterTable
ALTER TABLE "terms" ADD COLUMN     "status" "AcademicStatus" NOT NULL DEFAULT 'OPEN';

-- CreateTable
CREATE TABLE "school_its" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "schoolItId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stateId" TEXT NOT NULL,

    CONSTRAINT "school_its_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "school_its_userId_key" ON "school_its"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "school_its_schoolItId_key" ON "school_its"("schoolItId");

-- CreateIndex
CREATE UNIQUE INDEX "school_its_email_key" ON "school_its"("email");

-- AddForeignKey
ALTER TABLE "subeb_officers" ADD CONSTRAINT "subeb_officers_lgaId_fkey" FOREIGN KEY ("lgaId") REFERENCES "local_government_areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_its" ADD CONSTRAINT "school_its_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_its" ADD CONSTRAINT "school_its_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_its" ADD CONSTRAINT "school_its_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

