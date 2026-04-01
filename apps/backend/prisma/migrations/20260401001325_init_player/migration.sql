-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'unknown');

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "whatsapp" TEXT,
    "photo_url" TEXT,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
    
);

-- CreateIndex
CREATE UNIQUE INDEX "players_user_id_key" ON "players"("user_id");
