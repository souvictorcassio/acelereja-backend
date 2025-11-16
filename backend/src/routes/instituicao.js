// routes/instituicao.js
import express from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { formatText } from "../utils/formatText.js";

const router = express.Router();
const prisma = new PrismaClient();

// 📌 ROTA PARA LISTAR TODAS AS INSTITUIÇÕES
router.get("/", async (req, res) => {
  try {
    const instituicoes = await prisma.instituicao.findMany();
    res.json(instituicoes);
  } catch (error) {
    console.error("Erro ao listar instituições:", error);
    res.status(500).json({ erro: "Erro ao buscar instituições." });
  }
});

// 📌 ROTA DE CADASTRO DE INSTITUIÇÃO
router.post("/cadastrar", async (req, res) => {
  try {
    let {
      nome,
      codigoINEP,
      estado,
      cidade,
      bairro,
      rua,
      numero,
      cep,
      telefone,
      email,
      senha,
      turnos,
      niveis,
      admissao,
      observacoes,
      governoId,
    } = req.body;

    // 🧹 Padroniza campos de endereço
    cidade = formatText(cidade);
    bairro = formatText(bairro);
    rua = formatText(rua);

    // Validação básica
    if (!email || !senha || !nome || !codigoINEP) {
      return res
        .status(400)
        .json({ erro: "Preencha todos os campos obrigatórios." });
    }

    // Verifica se já existe uma instituição com o mesmo e-mail ou INEP
    const jaExiste = await prisma.user.findUnique({ where: { email } });
    if (jaExiste) {
      return res.status(400).json({ erro: "E-mail já cadastrado." });
    }

    const inepDuplicado = await prisma.instituicao.findUnique({
      where: { codigoINEP },
    });
    if (inepDuplicado) {
      return res.status(400).json({ erro: "Código INEP já cadastrado." });
    }

    // 🔒 Criptografa a senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Cria o registro da instituição
    const instituicao = await prisma.instituicao.create({
      data: {
        nome,
        codigoINEP,
        estado,
        cidade,
        bairro,
        rua,
        numero,
        cep,
        telefone,
        email,
        turnos,
        niveis,
        admissao,
        observacoes,
        governo: governoId ? { connect: { id: Number(governoId) } } : undefined,
      },
    });

    // Cria o usuário vinculado
    await prisma.user.create({
      data: {
        email,
        senha: senhaCriptografada,
        tipo: "INSTITUICAO",
        instituicao: { connect: { id: instituicao.id } },
      },
    });

    res.status(201).json({ message: "Instituição cadastrada com sucesso!" });
  } catch (error) {
    console.error("Erro ao cadastrar instituição:", error);
    res.status(500).json({ erro: "Erro interno do servidor." });
  }
});

// ✅ ROTA: Obter dados do Dashboard da Instituição
router.get("/:instituicaoId/dashboard", async (req, res) => {
  try {
    const { instituicaoId } = req.params;
    // Busca a instituição com suas matrículas e dados da população
    const instituicao = await prisma.instituicao.findUnique({
      where: { id: Number(instituicaoId) },
      include: {
        matriculas: {
          include: {
            populacao: true,
          },
        },
      },
    });

    if (!instituicao) {
      return res.status(404).json({ erro: "Instituição não encontrada." });
    }

    // Contagem das métricas
    const total = instituicao.matriculas.length;
    const pendentes = instituicao.matriculas.filter(
      (m) => m.status === "PENDENTE"
    ).length;
    const deferidos = instituicao.matriculas.filter(
      (m) => m.status === "DEFERIDA"
    ).length;
    const indeferidos = instituicao.matriculas.filter(
      (m) => m.status === "INDEFERIDA"
    ).length;

    res.json({
      instituicao: instituicao.nome,
      total,
      pendentes,
      deferidos,
      indeferidos,
      matriculas: instituicao.matriculas.map((m) => ({
        id: m.id,
        nome: m.populacao.nome,
        cpf: m.populacao.cpf,
        nivel: m.populacao.escolaridade,
        contato: m.populacao.telefone,
        status: m.status,
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar dashboard:", error);
    res.status(500).json({ erro: "Erro ao buscar dados do dashboard." });
  }
});

// ✅ ROTA: Atualizar status de matrícula
router.put("/matricula/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["DEFERIDA", "INDEFERIDA"].includes(status)) {
      return res.status(400).json({ erro: "Status inválido." });
    }

    const matriculaAtualizada = await prisma.matricula.update({
      where: { id: Number(id) },
      data: { status, dataResposta: new Date() },
    });

    res.json(matriculaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    res.status(500).json({ erro: "Erro ao atualizar status da matrícula." });
  }
});

// ✅ ROTA: Realizar matrícula (somente usuários da população)
router.post("/:instituicaoId/matricular", async (req, res) => {
  try {
    const { instituicaoId } = req.params;
    const { populacaoId } = req.body; // virá do frontend

    if (!populacaoId) {
      return res.status(400).json({ erro: "ID da população é obrigatório." });
    }

    // 🔹 Verifica se o usuário da população existe
    const populacao = await prisma.populacao.findUnique({
      where: { id: Number(populacaoId) },
    });

    if (!populacao) {
      return res.status(404).json({ erro: "População não encontrada." });
    }

    // 🔹 Verifica se a instituição existe
    const instituicao = await prisma.instituicao.findUnique({
      where: { id: Number(instituicaoId) },
    });

    if (!instituicao) {
      return res.status(404).json({ erro: "Instituição não encontrada." });
    }

    // 🔹 Impede duplicidade (já matriculado)
    const jaExiste = await prisma.matricula.findFirst({
      where: {
        populacaoId: Number(populacaoId),
        instituicaoId: Number(instituicaoId),
      },
    });

    if (jaExiste) {
      return res.status(400).json({
        erro: "Você já possui uma matrícula nesta instituição.",
      });
    }

    // ✅ Cria a matrícula
    const novaMatricula = await prisma.matricula.create({
      data: {
        populacaoId: Number(populacaoId),
        instituicaoId: Number(instituicaoId),
      },
    });

    res.status(201).json({
      message: "Matrícula realizada com sucesso!",
      matricula: novaMatricula,
    });
  } catch (error) {
    console.error("❌ Erro ao realizar matrícula:", error);
    res.status(500).json({ erro: "Erro ao realizar matrícula." });
  }
});

export default router;
