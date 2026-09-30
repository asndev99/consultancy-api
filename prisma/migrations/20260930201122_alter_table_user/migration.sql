-- AlterTable
ALTER TABLE "StudentApplication" ADD COLUMN     "targetCountry" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordChangedAt" TIMESTAMPTZ;
