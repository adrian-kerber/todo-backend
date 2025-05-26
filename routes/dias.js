import express from "express";
import pool from "../db.js";

const router = express.Router();

// Listar todos os dias
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM dias ORDER BY data DESC");
    // Sempre retorna data como YYYY-MM-DDT12:00:00Z
    const ajustados = rows.map(dia => ({
      ...dia,
      data: dia.data instanceof Date
        ? `${dia.data.toISOString().slice(0, 10)}T12:00:00Z`
        : `${dia.data.slice(0, 10)}T12:00:00Z`
    }));
    res.json(ajustados);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar dias" });
  }
});

// Buscar um dia específico pelo ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM dias WHERE id = $1", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Dia não encontrado" });
    const dia = rows[0];
    dia.data = dia.data instanceof Date
      ? `${dia.data.toISOString().slice(0, 10)}T12:00:00Z`
      : `${dia.data.slice(0, 10)}T12:00:00Z`;
    res.json(dia);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar dia" });
  }
});

// Criar novo dia
router.post("/", async (req, res) => {
  let { data, titulo, emoji, capa_url } = req.body;
  try {
    // Salva só YYYY-MM-DD no banco, não o horário
    const { rows } = await pool.query(
      "INSERT INTO dias (data, titulo, emoji, capa_url) VALUES ($1, $2, $3, $4) RETURNING *",
      [data ? data.slice(0, 10) : null, titulo, emoji, capa_url]
    );
    // Retorna sempre com T12:00:00Z pro frontend
    const dia = rows[0];
    dia.data = dia.data instanceof Date
      ? `${dia.data.toISOString().slice(0, 10)}T12:00:00Z`
      : `${dia.data.slice(0, 10)}T12:00:00Z`;
    res.status(201).json(dia);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar dia" });
  }
});

// Editar dia
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  let { data, titulo, emoji, capa_url } = req.body;
  try {
    // Salva só YYYY-MM-DD no banco
    const { rows } = await pool.query(
      "UPDATE dias SET data=$1, titulo=$2, emoji=$3, capa_url=$4 WHERE id=$5 RETURNING *",
      [data ? data.slice(0, 10) : null, titulo, emoji, capa_url, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Dia não encontrado" });
    const dia = rows[0];
    dia.data = dia.data instanceof Date
      ? `${dia.data.toISOString().slice(0, 10)}T12:00:00Z`
      : `${dia.data.slice(0, 10)}T12:00:00Z`;
    res.json(dia);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao editar dia" });
  }
});

// Deletar dia
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query("DELETE FROM dias WHERE id=$1", [id]);
    if (rowCount === 0) return res.status(404).json({ error: "Dia não encontrado" });
    res.json({ message: "Dia deletado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar dia" });
  }
});

export default router;
