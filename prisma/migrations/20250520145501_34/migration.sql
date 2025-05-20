/*
  Warnings:

  - You are about to alter the column `priceDaily` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Added the required column `minWorkingHours` to the `Level` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Level" ADD COLUMN     "minWorkingHours" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "priceDaily" SET DATA TYPE INTEGER;
