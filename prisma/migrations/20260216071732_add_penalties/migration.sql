-- CreateTable
CREATE TABLE "Penalty" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "offence" TEXT NOT NULL,

    CONSTRAINT "Penalty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Penalty_gameId_idx" ON "Penalty"("gameId");

-- AddForeignKey
ALTER TABLE "Penalty" ADD CONSTRAINT "Penalty_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
