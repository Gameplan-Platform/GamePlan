-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "recordedById" TEXT NOT NULL,
    "eventName" TEXT,
    "score" DOUBLE PRECISION NOT NULL,
    "deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Score_moduleId_athleteId_idx" ON "Score"("moduleId", "athleteId");

-- CreateIndex
CREATE INDEX "Score_moduleId_date_idx" ON "Score"("moduleId", "date");

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
