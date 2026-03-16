-- CreateEnum
CREATE TYPE "ModuleMemberRole" AS ENUM ('MODULE_ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "ModuleType" AS ENUM ('CUSTOM', 'SYSTEM');

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "joinCode" TEXT NOT NULL,
    "type" "ModuleType" NOT NULL DEFAULT 'CUSTOM',
    "systemKey" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "memberRole" "ModuleMemberRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModuleMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Module_joinCode_key" ON "Module"("joinCode");

-- CreateIndex
CREATE UNIQUE INDEX "Module_systemKey_key" ON "Module"("systemKey");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleMembership_userId_moduleId_key" ON "ModuleMembership"("userId", "moduleId");

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleMembership" ADD CONSTRAINT "ModuleMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleMembership" ADD CONSTRAINT "ModuleMembership_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
