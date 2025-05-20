/*
  Warnings:

  - Added the required column `priceDaily` to the `Level` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceHourly` to the `Level` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Level" ADD COLUMN     "priceDaily" INTEGER NOT NULL,
ADD COLUMN     "priceHourly" DOUBLE PRECISION NOT NULL;
