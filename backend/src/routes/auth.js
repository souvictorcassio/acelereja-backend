// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// ROTA DE LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res
        .status(400)
        .json({ error: "E-mail e senha são obrigatórios." });
    }

    // Busca o usuário pelo e-mail
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        governo: true,
        populacao: true,
        instituicao: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Verifica a senha
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "Senha incorreta." });
    }

    // Retorna os dados essenciais
    return res.json({
      message: "Login bem-sucedido!",
      user: {
        id: user.id,
        email: user.email,
        tipo: user.tipo,
        nome:
          user.tipo === "GOVERNO"
            ? user.governo?.nomeResponsavel
            : user.tipo === "POPULACAO"
            ? user.populacao?.nome
            : user.instituicao?.nome,
        instituicaoId: user.instituicao?.id || null,
        populacaoId: user.populacao?.id || null,
        governoId: user.governo?.id || null,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

export default router;
