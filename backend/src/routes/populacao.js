import express from "express";
import bcrypt from "bcryptjs";
import prisma from "../prismaClient.js";
import { formatText } from "../utils/formatText.js";

const router = express.Router();

// POST /api/populacao/cadastrar
router.post("/cadastrar", async (req, res) => {
  try {
    let {
      nome,
      cpf,
      dataNascimento,
      telefone,
      estado,
      cidade,
      bairro,
      endereco,
      cep,
      escolaridade,
      email,
      senha,
    } = req.body;

    // 🧹 Padroniza os campos de texto
    cidade = formatText(cidade);
    bairro = formatText(bairro);
    endereco = formatText(endereco);

    // 🔒 Criptografar senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar registro no modelo Populacao e User (ligação 1:1)
    const novaPopulacao = await prisma.populacao.create({
      data: {
        nome,
        cpf,
        dataNascimento: new Date(dataNascimento),
        telefone,
        estado,
        cidade,
        bairro,
        endereco,
        cep,
        escolaridade,
        user: {
          create: {
            email,
            senha: senhaHash,
            tipo: "POPULACAO",
          },
        },
      },
      include: { user: true },
    });

    res.status(201).json({
      message: "População cadastrada com sucesso!",
      data: novaPopulacao,
    });
  } catch (error) {
    console.error("❌ Erro ao cadastrar população:", error);
    res.status(400).json({ error: "Erro ao cadastrar população." });
  }
});

// ✅ ROTA: Atualizar dados de contato e endereço
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { telefone, estado, cidade, bairro, endereco, cep } = req.body;

    const populacaoAtualizada = await prisma.populacao.update({
      where: { id: Number(id) },
      data: { telefone, estado, cidade, bairro, endereco, cep },
    });

    res.json({
      message: "Dados atualizados com sucesso!",
      populacao: populacaoAtualizada,
    });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ erro: "Erro ao atualizar perfil." });
  }
});

// ✅ ROTA: Buscar dados do perfil da população
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ❗ Correção essencial
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ erro: "ID inválido." });
    }

    const populacao = await prisma.populacao.findUnique({
      where: { id: Number(id) },
      include: {
        matriculas: {
          include: {
            instituicao: true,
          },
        },
      },
    });

    if (!populacao) {
      return res.status(404).json({ erro: "População não encontrada." });
    }

    res.json(populacao);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({ erro: "Erro ao buscar perfil da população." });
  }
});

export default router;
