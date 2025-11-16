import express from "express";
import cors from "cors";
import populacaoRoutes from "./routes/populacao.js";
import governoRoutes from "./routes/governo.js";
import instituicaoRoutes from "./routes/instituicao.js";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/populacao", populacaoRoutes);
app.use("/api/governo", governoRoutes);
app.use("/api/instituicao", instituicaoRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
