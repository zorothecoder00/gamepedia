-- CreateEnum
CREATE TYPE "WagerStatus" AS ENUM ('OPEN', 'ACCEPTED', 'AWAITING_DEPOSITS', 'ONGOING', 'AWAITING_RESULT', 'RESULT_REPORTED', 'DISPUTED', 'AWAITING_PAYOUT', 'SETTLED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "WagerVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('MOBILE_MONEY', 'BANK_CARD', 'WESTERN_UNION', 'BANK_TRANSFER', 'OTHER');

-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'RESOLVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'WAGER';

-- AlterTable
ALTER TABLE "players" ADD COLUMN     "acceptedWagerCgu" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isAdult" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentDefaults" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "trustScore" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "wagersPlayed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "wagersWon" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "platform_payment_accounts" (
    "id" TEXT NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "label" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "instructions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_payment_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_payout_methods" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "label" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_payout_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wagers" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "challengerId" TEXT NOT NULL,
    "opponentId" TEXT,
    "stakeAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'XOF',
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "terms" TEXT,
    "visibility" "WagerVisibility" NOT NULL DEFAULT 'PUBLIC',
    "status" "WagerStatus" NOT NULL DEFAULT 'OPEN',
    "challengerAgreed" BOOLEAN NOT NULL DEFAULT false,
    "opponentAgreed" BOOLEAN NOT NULL DEFAULT false,
    "winnerId" TEXT,
    "acceptDeadline" TIMESTAMP(3),
    "playByDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "settledAt" TIMESTAMP(3),

    CONSTRAINT "wagers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wager_deposits" (
    "id" TEXT NOT NULL,
    "wagerId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "methodType" "PaymentMethodType" NOT NULL,
    "proofUrl" TEXT,
    "reference" TEXT,
    "status" "DepositStatus" NOT NULL DEFAULT 'PENDING',
    "confirmedByUserId" TEXT,
    "confirmedByName" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wager_deposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wager_reports" (
    "id" TEXT NOT NULL,
    "wagerId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "claimedWinnerId" TEXT NOT NULL,
    "proofUrl" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wager_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wager_disputes" (
    "id" TEXT NOT NULL,
    "wagerId" TEXT NOT NULL,
    "openedById" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedByUserId" TEXT,
    "resolvedByName" TEXT,
    "resolution" TEXT,
    "resolvedWinnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "wager_disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wager_payouts" (
    "id" TEXT NOT NULL,
    "wagerId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "methodType" "PaymentMethodType" NOT NULL,
    "proofUrl" TEXT,
    "note" TEXT,
    "paidByUserId" TEXT,
    "paidByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wager_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "platform_payment_accounts_isActive_idx" ON "platform_payment_accounts"("isActive");

-- CreateIndex
CREATE INDEX "player_payout_methods_playerId_isActive_idx" ON "player_payout_methods"("playerId", "isActive");

-- CreateIndex
CREATE INDEX "wagers_gameId_status_idx" ON "wagers"("gameId", "status");

-- CreateIndex
CREATE INDEX "wagers_challengerId_idx" ON "wagers"("challengerId");

-- CreateIndex
CREATE INDEX "wagers_opponentId_idx" ON "wagers"("opponentId");

-- CreateIndex
CREATE UNIQUE INDEX "wager_deposits_wagerId_playerId_key" ON "wager_deposits"("wagerId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "wager_reports_wagerId_reporterId_key" ON "wager_reports"("wagerId", "reporterId");

-- CreateIndex
CREATE UNIQUE INDEX "wager_disputes_wagerId_key" ON "wager_disputes"("wagerId");

-- CreateIndex
CREATE UNIQUE INDEX "wager_payouts_wagerId_key" ON "wager_payouts"("wagerId");

-- AddForeignKey
ALTER TABLE "player_payout_methods" ADD CONSTRAINT "player_payout_methods_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wagers" ADD CONSTRAINT "wagers_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wagers" ADD CONSTRAINT "wagers_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wagers" ADD CONSTRAINT "wagers_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wagers" ADD CONSTRAINT "wagers_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wager_deposits" ADD CONSTRAINT "wager_deposits_wagerId_fkey" FOREIGN KEY ("wagerId") REFERENCES "wagers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wager_deposits" ADD CONSTRAINT "wager_deposits_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wager_reports" ADD CONSTRAINT "wager_reports_wagerId_fkey" FOREIGN KEY ("wagerId") REFERENCES "wagers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wager_reports" ADD CONSTRAINT "wager_reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wager_disputes" ADD CONSTRAINT "wager_disputes_wagerId_fkey" FOREIGN KEY ("wagerId") REFERENCES "wagers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wager_disputes" ADD CONSTRAINT "wager_disputes_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wager_payouts" ADD CONSTRAINT "wager_payouts_wagerId_fkey" FOREIGN KEY ("wagerId") REFERENCES "wagers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wager_payouts" ADD CONSTRAINT "wager_payouts_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
