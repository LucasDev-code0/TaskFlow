import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import tarefasRoutes from "./routes/tarefas.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rota inicial
app.get("/", (req, res) => {
    res.json({
        mensagem: "API do Sistema de Tarefas funcionando!"
    });
});

// Rotas de tarefas
app.use("/api/tarefas", tarefasRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});