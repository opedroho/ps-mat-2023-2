-- CreateTable
CREATE TABLE "Salesperson" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "ident_document" TEXT NOT NULL,
    "salary" DECIMAL(65,30) NOT NULL,
    "phone" TEXT NOT NULL,
    "date_of_hire" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Salesperson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Salesperson_user_id_key" ON "Salesperson"("user_id");

-- AddForeignKey
ALTER TABLE "Salesperson" ADD CONSTRAINT "Salesperson_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
