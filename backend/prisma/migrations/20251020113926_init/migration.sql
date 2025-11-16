-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "governoId" INTEGER,
    "populacaoId" INTEGER,
    "instituicaoId" INTEGER,
    CONSTRAINT "User_governoId_fkey" FOREIGN KEY ("governoId") REFERENCES "Governo" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_populacaoId_fkey" FOREIGN KEY ("populacaoId") REFERENCES "Populacao" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_instituicaoId_fkey" FOREIGN KEY ("instituicaoId") REFERENCES "Instituicao" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Governo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nomeResponsavel" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "secretaria" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "telefone" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Populacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "dataNascimento" DATETIME NOT NULL,
    "telefone" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "escolaridade" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Instituicao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "codigoINEP" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "turnos" TEXT NOT NULL,
    "niveis" TEXT NOT NULL,
    "admissao" TEXT NOT NULL,
    "observacoes" TEXT,
    "governoId" INTEGER,
    CONSTRAINT "Instituicao_governoId_fkey" FOREIGN KEY ("governoId") REFERENCES "Governo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Matricula" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "populacaoId" INTEGER NOT NULL,
    "instituicaoId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "dataSolicitacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataResposta" DATETIME,
    CONSTRAINT "Matricula_populacaoId_fkey" FOREIGN KEY ("populacaoId") REFERENCES "Populacao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Matricula_instituicaoId_fkey" FOREIGN KEY ("instituicaoId") REFERENCES "Instituicao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_governoId_key" ON "User"("governoId");

-- CreateIndex
CREATE UNIQUE INDEX "User_populacaoId_key" ON "User"("populacaoId");

-- CreateIndex
CREATE UNIQUE INDEX "User_instituicaoId_key" ON "User"("instituicaoId");

-- CreateIndex
CREATE UNIQUE INDEX "Populacao_cpf_key" ON "Populacao"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Instituicao_codigoINEP_key" ON "Instituicao"("codigoINEP");
