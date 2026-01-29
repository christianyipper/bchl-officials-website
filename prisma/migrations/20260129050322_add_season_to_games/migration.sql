-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "season" TEXT NOT NULL DEFAULT '2024-25';

-- CreateIndex
CREATE INDEX "Game_season_idx" ON "Game"("season");
