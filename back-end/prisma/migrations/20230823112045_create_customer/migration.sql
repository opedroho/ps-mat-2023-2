-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ident_document" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3),
    "street_name" TEXT NOT NULL,
    "house_number" TEXT NOT NULL,
    "complements" TEXT,
    "neighborhood" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
