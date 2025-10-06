-- AlterTable
ALTER TABLE "local_government_areas" ADD COLUMN     "stateId" TEXT;

-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "stateId" TEXT;

-- CreateTable
CREATE TABLE "states" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "stateId" TEXT NOT NULL,
    "contactEmail" TEXT,
    "stateName" TEXT NOT NULL,
    "code" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "states_externalId_key" ON "states"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "states_stateId_key" ON "states"("stateId");

-- CreateIndex
CREATE UNIQUE INDEX "states_contactEmail_key" ON "states"("contactEmail");

-- CreateIndex
CREATE UNIQUE INDEX "states_stateName_key" ON "states"("stateName");

-- CreateIndex
CREATE UNIQUE INDEX "states_code_key" ON "states"("code");

-- AddForeignKey
ALTER TABLE "local_government_areas" ADD CONSTRAINT "local_government_areas_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE SET NULL ON UPDATE CASCADE;
