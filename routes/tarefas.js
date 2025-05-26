import express from "express";
import pool from "../db.js";

const router = express.Router();

// Listar todas as tarefas de uma seção
router.get("/secao/:secao_id", async (req, res) => {
  const { secao_id } = req.params;
  try {
    const { rows } = await pool.query(
      "SELECT * FROM tarefas WHERE secao_id = $1 ORDER BY ordem ASC NULLS LAST, id ASC",
      [secao_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar tarefas" });
  }
});

// Buscar tarefa específica
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      "SELECT * FROM tarefas WHERE id = $1",
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Tarefa não encontrada" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar tarefa" });
  }
});

// Criar nova tarefa
router.post("/", async (req, res) => {
  const { secao_id, texto, feito, tipo, ordem } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO tarefas (secao_id, texto, feito, tipo, ordem) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [secao_id, texto, feito || false, tipo || "checkbox", ordem || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar tarefa" });
  }
});

// Editar tarefa
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { texto, feito, tipo, ordem } = req.body;
  try {
    const { rows } = await pool.query(
      "UPDATE tarefas SET texto=$1, feito=$2, tipo=$3, ordem=$4 WHERE id=$5 RETURNING *",
      [texto, feito, tipo, ordem, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Tarefa não encontrada" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao editar tarefa" });
  }
});

// Deletar tarefa
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query("DELETE FROM tarefas WHERE id=$1", [id]);
    if (rowCount === 0) return res.status(404).json({ error: "Tarefa não encontrada" });
    res.json({ message: "Tarefa deletada com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar tarefa" });
  }
});

export default router;
