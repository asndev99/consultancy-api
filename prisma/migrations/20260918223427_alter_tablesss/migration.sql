/*
  Warnings:

  - You are about to drop the column `counselorId` on the `StudentApplication` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `StudentApplicationRemarks` table. All the data in the column will be lost.
  - You are about to drop the `ApplicationDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ApplicationDocumentMedia` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `authorId` to the `StudentApplicationRemarks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ApplicationDocument" DROP CONSTRAINT "ApplicationDocument_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "ApplicationDocumentMedia" DROP CONSTRAINT "ApplicationDocumentMedia_documentId_fkey";

-- DropForeignKey
ALTER TABLE "StudentApplication" DROP CONSTRAINT "StudentApplication_counselorId_fkey";

-- AlterTable
ALTER TABLE "StudentApplication" DROP COLUMN "counselorId",
ADD COLUMN     "applicationTargetCourses" TEXT[];

-- AlterTable
ALTER TABLE "StudentApplicationRemarks" DROP COLUMN "createdBy",
ADD COLUMN     "authorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "StudentApplicationTeam" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "ApplicationDocument";

-- DropTable
DROP TABLE "ApplicationDocumentMedia";

-- CreateTable
CREATE TABLE "StudentDocumentMedia" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "documentId" INTEGER NOT NULL,
    "mediaType" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" INTEGER NOT NULL,
    "updatedBy" INTEGER,
    "deletedBy" INTEGER,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "StudentDocumentMedia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StudentDocumentMedia" ADD CONSTRAINT "StudentDocumentMedia_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentDocumentMedia" ADD CONSTRAINT "StudentDocumentMedia_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "DocumentTitle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentApplicationRemarks" ADD CONSTRAINT "StudentApplicationRemarks_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
