function createInMemoryTodoRepository(seed = []) {
  let todos = seed.map((todo) => ({ ...todo }));
  let nextId = todos.reduce((max, todo) => Math.max(max, todo.id), 0) + 1;

  return {
    async findAll() {
      return todos.map((todo) => ({ ...todo }));
    },
    async findById(id) {
      return todos.find((todo) => todo.id === id) ?? null;
    },
    async create({ title }) {
      const todo = {
        id: nextId++,
        title,
        completed: false,
        created_at: new Date().toISOString(),
      };
      todos.push(todo);
      return todo;
    },
    async update(id, { title, completed }) {
      const todo = todos.find((item) => item.id === id);
      if (!todo) return null;
      if (title !== undefined) todo.title = title;
      if (completed !== undefined) todo.completed = completed;
      return todo;
    },
    async remove(id) {
      const before = todos.length;
      todos = todos.filter((todo) => todo.id !== id);
      return todos.length < before;
    },
  };
}

module.exports = { createInMemoryTodoRepository };
