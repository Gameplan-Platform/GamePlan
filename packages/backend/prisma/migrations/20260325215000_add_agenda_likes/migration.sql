-- CreateTable
CREATE TABLE "AgendaLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agendaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgendaLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgendaLike_userId_agendaId_key" ON "AgendaLike"("userId", "agendaId");

-- AddForeignKey
ALTER TABLE "AgendaLike" ADD CONSTRAINT "AgendaLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgendaLike" ADD CONSTRAINT "AgendaLike_agendaId_fkey" FOREIGN KEY ("agendaId") REFERENCES "Agenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;
