import express from "express";
import pool from "../db.js";

const router = express.Router();

// Listar todas as seções de um dia
router.get("/dia/:dia_id", async (req, res) => {
  const { dia_id } = req.params;
  try {
    const { rows } = await pool.query(
      "SELECT * FROM secoes WHERE dia_id = $1 ORDER BY id ASC",
      [dia_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar seções" });
  }
});

// Buscar uma seção específica pelo ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      "SELECT * FROM secoes WHERE id = $1",
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Seção não encontrada" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar seção" });
  }
});

// Criar nova seção em um dia
router.post("/", async (req, res) => {
  const { dia_id, nome, emoji, cor } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO secoes (dia_id, nome, emoji, cor) VALUES ($1, $2, $3, $4) RETURNING *",
      [dia_id, nome, emoji, cor]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar seção" });
  }
});

// Editar seção
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, emoji, cor } = req.body;
  try {
    const { rows } = await pool.query(
      "UPDATE secoes SET nome=$1, emoji=$2, cor=$3 WHERE id=$4 RETURNING *",
      [nome, emoji, cor, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Seção não encontrada" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao editar seção" });
  }
});

// Deletar seção
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query("DELETE FROM secoes WHERE id=$1", [id]);
    if (rowCount === 0) return res.status(404).json({ error: "Seção não encontrada" });
    res.json({ message: "Seção deletada com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar seção" });
  }
});

export default router;
