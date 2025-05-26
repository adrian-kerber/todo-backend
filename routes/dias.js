import express from "express";
import pool from "../db.js";

const router = express.Router();

// Listar todos os dias
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM dias ORDER BY data DESC");
    res.json(rows);
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
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar dia" });
  }
});

// Criar novo dia
router.post("/", async (req, res) => {
  const { data, titulo, emoji, capa_url } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO dias (data, titulo, emoji, capa_url) VALUES ($1, $2, $3, $4) RETURNING *",
      [data, titulo, emoji, capa_url]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar dia" });
  }
});

// Editar dia
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { data, titulo, emoji, capa_url } = req.body;
  try {
    const { rows } = await pool.query(
      "UPDATE dias SET data=$1, titulo=$2, emoji=$3, capa_url=$4 WHERE id=$5 RETURNING *",
      [data, titulo, emoji, capa_url, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Dia não encontrado" });
    res.json(rows[0]);
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
