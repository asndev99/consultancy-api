-- AlterTable
ALTER TABLE "StudentApplication" ADD COLUMN     "subAgentId" INTEGER;

-- AddForeignKey
ALTER TABLE "StudentApplication" ADD CONSTRAINT "StudentApplication_subAgentId_fkey" FOREIGN KEY ("subAgentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
