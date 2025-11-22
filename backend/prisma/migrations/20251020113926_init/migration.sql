-- CreateTable: Governo
CREATE TABLE "Governo" (
    "id" SERIAL PRIMARY KEY,
    "nomeResponsavel" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "secretaria" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "telefone" TEXT NOT NULL
);

-- CreateTable: Populacao
CREATE TABLE "Populacao" (
    "id" SERIAL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP NOT NULL,
    "telefone" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "escolaridade" TEXT NOT NULL
);

-- CreateTable: Instituicao
CREATE TABLE "Instituicao" (
    "id" SERIAL PRIMARY KEY,
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
    CONSTRAINT "Instituicao_governoId_fkey"
        FOREIGN KEY ("governoId") REFERENCES "Governo"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable: User
CREATE TABLE "User" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "governoId" INTEGER,
    "populacaoId" INTEGER,
    "instituicaoId" INTEGER,
    CONSTRAINT "User_governoId_fkey"
        FOREIGN KEY ("governoId") REFERENCES "Governo"("id")
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_populacaoId_fkey"
        FOREIGN KEY ("populacaoId") REFERENCES "Populacao"("id")
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_instituicaoId_fkey"
        FOREIGN KEY ("instituicaoId") REFERENCES "Instituicao"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable: Matricula
CREATE TABLE "Matricula" (
    "id" SERIAL PRIMARY KEY,
    "populacaoId" INTEGER NOT NULL,
    "instituicaoId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "dataSolicitacao" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataResposta" TIMESTAMP,
    CONSTRAINT "Matricula_populacaoId_fkey"
        FOREIGN KEY ("populacaoId") REFERENCES "Populacao"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Matricula_instituicaoId_fkey"
        FOREIGN KEY ("instituicaoId") REFERENCES "Instituicao"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE UNIQUE INDEX "User_governoId_key" ON "User"("governoId");

CREATE UNIQUE INDEX "User_populacaoId_key" ON "User"("populacaoId");

CREATE UNIQUE INDEX "User_instituicaoId_key" ON "User"("instituicaoId");

CREATE UNIQUE INDEX "Populacao_cpf_key" ON "Populacao"("cpf");

CREATE UNIQUE INDEX "Instituicao_codigoINEP_key" ON "Instituicao"("codigoINEP");
