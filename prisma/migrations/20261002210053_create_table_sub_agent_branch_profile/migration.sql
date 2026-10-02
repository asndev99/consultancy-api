-- CreateTable
CREATE TABLE "SubAgentBranchProfile" (
    "id" SERIAL NOT NULL,
    "userBranchId" INTEGER NOT NULL,
    "referredStudents" INTEGER NOT NULL DEFAULT 0,
    "companyName" TEXT,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "targetCountries" JSONB NOT NULL DEFAULT '[]',
    "createdBy" INTEGER NOT NULL,
    "updatedBy" INTEGER,
    "deletedBy" INTEGER,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "SubAgentBranchProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubAgentBranchProfile_userBranchId_key" ON "SubAgentBranchProfile"("userBranchId");

-- AddForeignKey
ALTER TABLE "SubAgentBranchProfile" ADD CONSTRAINT "SubAgentBranchProfile_userBranchId_fkey" FOREIGN KEY ("userBranchId") REFERENCES "UserBranch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
