-- AlterTable
ALTER TABLE "states" ADD COLUMN     "totalOfficers" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "subeb_officers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "officerId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "designation" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stateId" TEXT,

    CONSTRAINT "subeb_officers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subeb_officers_userId_key" ON "subeb_officers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subeb_officers_officerId_key" ON "subeb_officers"("officerId");

-- CreateIndex
CREATE UNIQUE INDEX "subeb_officers_email_key" ON "subeb_officers"("email");

-- AddForeignKey
ALTER TABLE "subeb_officers" ADD CONSTRAINT "subeb_officers_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subeb_officers" ADD CONSTRAINT "subeb_officers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
