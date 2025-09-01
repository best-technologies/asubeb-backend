/*
  Warnings:

  - You are about to drop the column `schoolId` on the `sessions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_schoolId_fkey";

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "schoolId";
