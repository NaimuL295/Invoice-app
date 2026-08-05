-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "customer_address" TEXT,
ADD COLUMN     "customer_number" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);
