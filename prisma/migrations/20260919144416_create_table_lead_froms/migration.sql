-- CreateEnum
CREATE TYPE "LeadFormType" AS ENUM ('ORG_LEVEL', 'BRANCH_LEVEL');

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "isFromLeadForm" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "leadFormId" INTEGER,
ADD COLUMN     "leadSource" TEXT;

-- CreateTable
CREATE TABLE "LeadForms" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "utmSource" TEXT,
    "type" "LeadFormType" NOT NULL,
    "businessId" INTEGER NOT NULL,
    "branchId" INTEGER,
    "targetDegreeLevel" TEXT NOT NULL,
    "targetCountries" TEXT[],
    "totalSubmissions" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" INTEGER NOT NULL,
    "updatedBy" INTEGER,
    "deletedBy" INTEGER,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "LeadForms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadSubmissions" (
    "id" SERIAL NOT NULL,
    "formId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNo" TEXT NOT NULL,
    "preferredTargetCountries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetDegreeLevel" TEXT,
    "additionalNotes" TEXT,
    "leadSource" TEXT,
    "syncStatus" BOOLEAN NOT NULL DEFAULT false,
    "failedReason" TEXT,
    "isTransferred" BOOLEAN NOT NULL DEFAULT false,
    "transferredBranchName" TEXT,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "deletedBy" INTEGER,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "LeadSubmissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeadForms_publicId_key" ON "LeadForms"("publicId");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_leadFormId_fkey" FOREIGN KEY ("leadFormId") REFERENCES "LeadForms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadForms" ADD CONSTRAINT "LeadForms_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadForms" ADD CONSTRAINT "LeadForms_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadSubmissions" ADD CONSTRAINT "LeadSubmissions_formId_fkey" FOREIGN KEY ("formId") REFERENCES "LeadForms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
