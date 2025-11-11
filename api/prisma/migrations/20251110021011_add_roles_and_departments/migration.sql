/*
  Warnings:

  - The `estado` column on the `Licitacion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `creadorId` to the `Licitacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Licitacion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('Administrador', 'Adquisiciones', 'Supervisor', 'Funcionario', 'Postulante');

-- CreateEnum
CREATE TYPE "EstadoLicitacion" AS ENUM ('Borrador', 'PendienteAprobacion', 'Aprobada', 'Abierta', 'En_revision', 'Cerrada', 'Rechazada');

-- AlterTable
ALTER TABLE "Licitacion" ADD COLUMN     "aprobadorId" INTEGER,
ADD COLUMN     "creadorId" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "departamentoId" INTEGER,
ADD COLUMN     "fechaAprobacion" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoLicitacion" NOT NULL DEFAULT 'Borrador';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "departamentoId" INTEGER,
ADD COLUMN     "rol" "Rol" NOT NULL DEFAULT 'Postulante';

-- DropEnum
DROP TYPE "Estado";

-- CreateTable
CREATE TABLE "Departamento" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Departamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Departamento_nombre_key" ON "Departamento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Departamento_codigo_key" ON "Departamento"("codigo");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Licitacion" ADD CONSTRAINT "Licitacion_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Licitacion" ADD CONSTRAINT "Licitacion_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Licitacion" ADD CONSTRAINT "Licitacion_aprobadorId_fkey" FOREIGN KEY ("aprobadorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
