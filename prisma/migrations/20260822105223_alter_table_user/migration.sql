-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneNumber" TEXT,
ALTER COLUMN "password" DROP NOT NULL;
