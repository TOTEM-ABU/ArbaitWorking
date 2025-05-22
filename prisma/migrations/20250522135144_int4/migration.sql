/*
  Warnings:

  - A unique constraint covering the columns `[passportImage]` on the table `Master` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Master_passportImage_key" ON "Master"("passportImage");
