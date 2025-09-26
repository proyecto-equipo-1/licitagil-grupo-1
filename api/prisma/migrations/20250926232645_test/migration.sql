-- CreateEnum
CREATE TYPE "Estado" AS ENUM ('Abierta', 'En_revision', 'Cerrada');

-- CreateTable
CREATE TABLE "Licitacion" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "Estado" NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCierre" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Licitacion_pkey" PRIMARY KEY ("id")
);
