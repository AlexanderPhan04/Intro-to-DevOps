const pool = require("../database/db");

async function getTodos(req, res, next) {
  try {
    const result = await pool.query(
      "SELECT * FROM todos ORDER BY id ASC"
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

async function getTodo(req, res, next) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM todos WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

async function createTodo(req, res, next) {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO todos (title)
      VALUES ($1)
      RETURNING *
      `,
      [title]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

async function updateTodo(req, res, next) {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    const result = await pool.query(
      `
      UPDATE todos
      SET
        title = COALESCE($1, title),
        completed = COALESCE($2, completed)
      WHERE id = $3
      RETURNING *
      `,
      [title, completed, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

async function deleteTodo(req, res, next) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
};