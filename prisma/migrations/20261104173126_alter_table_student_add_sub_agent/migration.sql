-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "subAgentId" INTEGER;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_subAgentId_fkey" FOREIGN KEY ("subAgentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
