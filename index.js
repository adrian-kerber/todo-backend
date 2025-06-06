import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import diasRouter from "./routes/dias.js";
import secoesRouter from "./routes/secoes.js";
import tarefasRouter from "./routes/tarefas.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/dias", diasRouter);
app.use("/secoes", secoesRouter);
app.use("/tarefas", tarefasRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
