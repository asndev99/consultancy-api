/*
  Warnings:

  - Made the column `branchCode` on table `Branch` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Branch" ALTER COLUMN "branchCode" SET NOT NULL;
