const TITLE_MAX_LENGTH = 255;

function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 && id <= 2147483647 ? id : null;
}

function validateTitle(title, errors) {
  if (typeof title !== "string" || title.trim() === "") {
    errors.push("title must be a non-empty string");
    return undefined;
  }
  const trimmed = title.trim();
  if (trimmed.length > TITLE_MAX_LENGTH) {
    errors.push(`title must be at most ${TITLE_MAX_LENGTH} characters`);
  }
  return trimmed;
}

function validateCreateTodo(body = {}) {
  const errors = [];
  const title = validateTitle(body.title, errors);
  return { errors, value: { title } };
}

function validateUpdateTodo(body = {}) {
  const errors = [];
  const value = {};

  if (body.title === undefined && body.completed === undefined) {
    errors.push("at least one of title or completed is required");
    return { errors, value };
  }

  if (body.title !== undefined) {
    value.title = validateTitle(body.title, errors);
  }

  if (body.completed !== undefined) {
    if (typeof body.completed !== "boolean") {
      errors.push("completed must be a boolean");
    } else {
      value.completed = body.completed;
    }
  }

  return { errors, value };
}

module.exports = {
  TITLE_MAX_LENGTH,
  parseId,
  validateCreateTodo,
  validateUpdateTodo,
};
