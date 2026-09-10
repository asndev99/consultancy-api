-- CreateEnum
CREATE TYPE "UniversityType" AS ENUM ('Public', 'Private');

-- AlterTable
ALTER TABLE "University" ADD COLUMN     "type" "UniversityType" NOT NULL DEFAULT 'Public';

-- AlterTable
ALTER TABLE "UniversityCourses" ADD COLUMN     "tutionFeeCurrency" TEXT,
ADD COLUMN     "tutionPeriod" TEXT;
