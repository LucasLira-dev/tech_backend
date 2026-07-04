-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_userId_fkey";

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
