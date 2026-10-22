-- AlterTable
ALTER TABLE "StudentApplication" ADD COLUMN     "counselorId" INTEGER;

-- AddForeignKey
ALTER TABLE "StudentApplication" ADD CONSTRAINT "StudentApplication_counselorId_fkey" FOREIGN KEY ("counselorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
