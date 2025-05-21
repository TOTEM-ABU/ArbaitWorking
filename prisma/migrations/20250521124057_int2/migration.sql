/*
  Warnings:

  - You are about to drop the `OrderMaster` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderMaster" DROP CONSTRAINT "OrderMaster_masterId_fkey";

-- DropForeignKey
ALTER TABLE "OrderMaster" DROP CONSTRAINT "OrderMaster_orderId_fkey";

-- DropTable
DROP TABLE "OrderMaster";
