-- CreateEnum
CREATE TYPE "EstadoValidacion" AS ENUM ('Borrador', 'Incompleta', 'Completa');

-- AlterTable
ALTER TABLE "Licitacion" ADD COLUMN     "estadoValidacion" "EstadoValidacion" NOT NULL DEFAULT 'Borrador',
ADD COLUMN     "fechaValidacion" TIMESTAMP(3),
ADD COLUMN     "mensajeValidacion" TEXT,
ADD COLUMN     "seccionesFaltantes" TEXT[] DEFAULT ARRAY[]::TEXT[];
