/*
  Warnings:

  - You are about to drop the column `inviteSentAt` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Branch` table. All the data in the column will be lost.
  - Added the required column `status` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Branch" DROP COLUMN "inviteSentAt",
DROP COLUMN "status";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "inviteSentAt" TIMESTAMPTZ,
ADD COLUMN     "status" TEXT NOT NULL;
