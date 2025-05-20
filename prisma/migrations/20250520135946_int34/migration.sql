/*
  Warnings:

  - You are about to drop the `ToolMaster` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `experience` on the `Master` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ToolMaster" DROP CONSTRAINT "ToolMaster_masterId_fkey";

-- DropForeignKey
ALTER TABLE "ToolMaster" DROP CONSTRAINT "ToolMaster_toolId_fkey";

-- AlterTable
ALTER TABLE "Master" DROP COLUMN "experience",
ADD COLUMN     "experience" INTEGER NOT NULL;

-- DropTable
DROP TABLE "ToolMaster";

-- CreateTable
CREATE TABLE "MasterStart" (
    "id" TEXT NOT NULL,
    "star" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "masterId" TEXT,

    CONSTRAINT "MasterStart_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MasterStart" ADD CONSTRAINT "MasterStart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterStart" ADD CONSTRAINT "MasterStart_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "Master"("id") ON DELETE SET NULL ON UPDATE CASCADE;
