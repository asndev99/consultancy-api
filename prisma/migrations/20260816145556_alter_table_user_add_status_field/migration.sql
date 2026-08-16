/*
  Warnings:

  - Added the required column `status` to the `Branch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "inviteSentAt" TIMESTAMPTZ,
ADD COLUMN     "status" TEXT NOT NULL,
ALTER COLUMN "isActive" SET DEFAULT false;
