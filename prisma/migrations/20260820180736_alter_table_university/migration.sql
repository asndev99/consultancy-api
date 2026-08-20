/*
  Warnings:

  - Added the required column `courseId` to the `UniversityIntakeDate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UniversityIntakeDate" DROP CONSTRAINT "UniversityIntakeDate_universityId_fkey";

-- AlterTable
ALTER TABLE "University" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "UniversityIntakeDate" ADD COLUMN     "courseId" INTEGER NOT NULL,
ALTER COLUMN "universityId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "UniversityIntakeDate" ADD CONSTRAINT "UniversityIntakeDate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "UniversityCourses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
