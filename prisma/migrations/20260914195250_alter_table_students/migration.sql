/*
  Warnings:

  - You are about to drop the column `firstName` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the `PreferredCountries` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[businessId,branchId,email,phoneNo]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fullName` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Made the column `branchId` on table `Student` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('NewLead', 'DocumentSubmitted', 'ApplicationSubmitted', 'VisaProcessing', 'Enrolled');

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_branchId_fkey";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "firstName",
ADD COLUMN     "counselorId" INTEGER,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "leadStage" "LeadStage" NOT NULL DEFAULT 'NewLead',
ADD COLUMN     "preferredTargetCountries" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "previousBranch" TEXT,
ADD COLUMN     "studentTransferredAt" TIMESTAMP(3),
ADD COLUMN     "targetDegree" TEXT,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "branchId" SET NOT NULL;

-- DropTable
DROP TABLE "PreferredCountries";

-- CreateTable
CREATE TABLE "TargetUniversity" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "universityId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" INTEGER NOT NULL,
    "updatedBy" INTEGER,
    "deletedBy" INTEGER,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "TargetUniversity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TargetCourse" (
    "id" SERIAL NOT NULL,
    "targetUniversityId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "updatedBy" INTEGER,
    "deletedBy" INTEGER,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "TargetCourse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TargetUniversity_studentId_universityId_key" ON "TargetUniversity"("studentId", "universityId");

-- CreateIndex
CREATE UNIQUE INDEX "TargetCourse_targetUniversityId_courseId_key" ON "TargetCourse"("targetUniversityId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_businessId_branchId_email_phoneNo_key" ON "Student"("businessId", "branchId", "email", "phoneNo");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_counselorId_fkey" FOREIGN KEY ("counselorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TargetUniversity" ADD CONSTRAINT "TargetUniversity_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TargetUniversity" ADD CONSTRAINT "TargetUniversity_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TargetCourse" ADD CONSTRAINT "TargetCourse_targetUniversityId_fkey" FOREIGN KEY ("targetUniversityId") REFERENCES "TargetUniversity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TargetCourse" ADD CONSTRAINT "TargetCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "UniversityCourses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
