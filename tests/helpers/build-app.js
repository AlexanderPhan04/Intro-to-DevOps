const { createApp } = require("../../src/app");
const { createInMemoryTodoRepository } = require("./in-memory-todo.repository");

const silentLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  http: jest.fn(),
};

function buildApp(overrides = {}) {
  return createApp({
    todoRepository: createInMemoryTodoRepository(),
    checkDatabase: async () => {},
    logger: silentLogger,
    version: "test",
    ...overrides,
  });
}

module.exports = { buildApp, silentLogger };
