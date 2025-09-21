-- CreateTable
CREATE TABLE "public"."Petlogix" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "address" TEXT,
    "contact" TEXT,
    "species" TEXT,
    "breed" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Petlogix_pkey" PRIMARY KEY ("id")
);
