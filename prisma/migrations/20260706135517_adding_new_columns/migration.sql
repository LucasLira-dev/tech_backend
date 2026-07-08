/*
  Warnings:

  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSessionId]` on the table `order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "order" ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "stripeSessionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "order_stripePaymentIntentId_key" ON "order"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "order_stripeSessionId_key" ON "order"("stripeSessionId");
