const COLUMNS = "id, title, completed, created_at";

function createTodoRepository(db) {
  return {
    async findAll() {
      const { rows } = await db.query(
        `SELECT ${COLUMNS} FROM todos ORDER BY id ASC`
      );
      return rows;
    },

    async findById(id) {
      const { rows } = await db.query(
        `SELECT ${COLUMNS} FROM todos WHERE id = $1`,
        [id]
      );
      return rows[0] ?? null;
    },

    async create({ title }) {
      const { rows } = await db.query(
        `INSERT INTO todos (title) VALUES ($1) RETURNING ${COLUMNS}`,
        [title]
      );
      return rows[0];
    },

    async update(id, { title, completed }) {
      const { rows } = await db.query(
        `
        UPDATE todos
        SET
          title = COALESCE($1, title),
          completed = COALESCE($2, completed)
        WHERE id = $3
        RETURNING ${COLUMNS}
        `,
        [title ?? null, completed ?? null, id]
      );
      return rows[0] ?? null;
    },

    async remove(id) {
      const { rowCount } = await db.query("DELETE FROM todos WHERE id = $1", [
        id,
      ]);
      return rowCount > 0;
    },
  };
}

module.exports = { createTodoRepository };
