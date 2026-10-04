const {
  parseId,
  validateCreateTodo,
  validateUpdateTodo,
} = require("../validators/todo.validator");

const notFound = (res) => res.status(404).json({ message: "Todo not found" });
const invalidId = (res) => res.status(400).json({ message: "Invalid todo id" });
const invalidBody = (res, errors) =>
  res.status(400).json({ message: "Validation failed", errors });

function createTodoController(todoRepository) {
  return {
    async list(req, res) {
      res.json(await todoRepository.findAll());
    },

    async get(req, res) {
      const id = parseId(req.params.id);
      if (!id) return invalidId(res);

      const todo = await todoRepository.findById(id);
      if (!todo) return notFound(res);

      res.json(todo);
    },

    async create(req, res) {
      const { errors, value } = validateCreateTodo(req.body);
      if (errors.length) return invalidBody(res, errors);

      const todo = await todoRepository.create(value);
      res.status(201).json(todo);
    },

    async update(req, res) {
      const id = parseId(req.params.id);
      if (!id) return invalidId(res);

      const { errors, value } = validateUpdateTodo(req.body);
      if (errors.length) return invalidBody(res, errors);

      const todo = await todoRepository.update(id, value);
      if (!todo) return notFound(res);

      res.json(todo);
    },

    async remove(req, res) {
      const id = parseId(req.params.id);
      if (!id) return invalidId(res);

      const deleted = await todoRepository.remove(id);
      if (!deleted) return notFound(res);

      res.status(204).send();
    },
  };
}

module.exports = { createTodoController };
