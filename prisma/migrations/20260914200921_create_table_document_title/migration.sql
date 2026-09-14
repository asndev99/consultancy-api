-- CreateTable
CREATE TABLE "DocumentTitle" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "documentTitle" TEXT NOT NULL,
    "isMandatory" BOOLEAN NOT NULL,
    "quantity" INTEGER,
    "createdBy" INTEGER NOT NULL,
    "updatedBy" INTEGER,
    "deletedBy" INTEGER,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "DocumentTitle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DocumentTitle" ADD CONSTRAINT "DocumentTitle_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
