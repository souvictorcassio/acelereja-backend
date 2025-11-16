import express from "express";
import bcrypt from "bcryptjs";
import prisma from "../prismaClient.js";

const router = express.Router();

// POST /api/governo/cadastrar
router.post("/cadastrar", async (req, res) => {
  try {
    const {
      nomeResponsavel,
      cargo,
      secretaria,
      estado,
      telefone,
      email,
      senha,
    } = req.body;

    // Criptografa a senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Cria Governo e User (ligação 1:1)
    const novoGoverno = await prisma.governo.create({
      data: {
        nomeResponsavel,
        cargo,
        secretaria,
        estado,
        telefone,
        user: {
          create: {
            email,
            senha: senhaHash,
            tipo: "GOVERNO",
          },
        },
      },
      include: { user: true },
    });

    res
      .status(201)
      .json({ message: "Governo cadastrado com sucesso!", data: novoGoverno });
  } catch (error) {
    console.error("❌ Erro ao cadastrar governo:", error);
    res.status(400).json({ error: "Erro ao cadastrar governo." });
  }
});

// ✅ ROTA: Dashboard do Governo
router.get("/:governoId/dashboard", async (req, res) => {
  try {
    const { governoId } = req.params;

    // Busca o governo e as instituições associadas (via campo estado)
    const governo = await prisma.governo.findUnique({
      where: { id: Number(governoId) },
    });

    if (!governo) {
      return res.status(404).json({ erro: "Governo não encontrado." });
    }

    // Busca instituições do mesmo governo
    const instituicoes = await prisma.instituicao.findMany({
      where: { governoId: Number(governoId) },
      include: {
        matriculas: true,
      },
    });

    // Calcula métricas agregadas
    const totalInstituicoes = instituicoes.length;
    const totalMatriculas = instituicoes.reduce(
      (acc, inst) => acc + inst.matriculas.length,
      0
    );
    const pendentes = instituicoes.reduce(
      (acc, inst) =>
        acc + inst.matriculas.filter((m) => m.status === "PENDENTE").length,
      0
    );
    const deferidas = instituicoes.reduce(
      (acc, inst) =>
        acc + inst.matriculas.filter((m) => m.status === "DEFERIDA").length,
      0
    );
    const indeferidas = instituicoes.reduce(
      (acc, inst) =>
        acc + inst.matriculas.filter((m) => m.status === "INDEFERIDA").length,
      0
    );

    // 🧹 Agrupa as instituições por cidade (com padronização)
    const cidadesMap = {};

    instituicoes.forEach((inst) => {
      const cidadeFormatada = inst.cidade.trim().toLowerCase();
      const cidadeChave =
        cidadeFormatada.charAt(0).toUpperCase() + cidadeFormatada.slice(1);

      if (!cidadesMap[cidadeChave]) {
        cidadesMap[cidadeChave] = {
          cidade: cidadeChave,
          estado: inst.estado,
          matriculas: 0,
        };
      }

      cidadesMap[cidadeChave].matriculas += inst.matriculas.length;
    });

    // Converte o mapa em lista para o gráfico
    const graficoCidades = Object.values(cidadesMap);

    // Lista completa das instituições
    const instituicoesDetalhadas = instituicoes.map((i) => ({
      id: i.id,
      nome: i.nome,
      cidade: i.cidade,
      estado: i.estado,
      matriculas: i.matriculas.length,
    }));

    // Retorna o payload completo
    res.json({
      governo: governo.nomeResponsavel,
      estado: governo.estado,
      totalInstituicoes,
      totalMatriculas,
      pendentes,
      deferidas,
      indeferidas,
      graficoCidades, // <-- usado no gráfico
      instituicoes: instituicoesDetalhadas, // <-- usado na tabela
    });
  } catch (error) {
    console.error("Erro ao buscar dashboard do governo:", error);
    res.status(500).json({ erro: "Erro ao buscar dados do dashboard." });
  }
});

export default router;
