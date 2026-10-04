const {
  TITLE_MAX_LENGTH,
  parseId,
  validateCreateTodo,
  validateUpdateTodo,
} = require("../src/validators/todo.validator");

describe("todo.validator", () => {
  describe("parseId", () => {
    it.each([
      ["1", 1],
      ["42", 42],
    ])("parses %s", (raw, expected) => {
      expect(parseId(raw)).toBe(expected);
    });

    it.each(["0", "-1", "1.5", "abc", "", "99999999999"])("rejects %p", (raw) => {
      expect(parseId(raw)).toBeNull();
    });
  });

  describe("validateCreateTodo", () => {
    it("accepts and trims a valid title", () => {
      expect(validateCreateTodo({ title: "  Hello " })).toEqual({
        errors: [],
        value: { title: "Hello" },
      });
    });

    it("rejects non-string titles", () => {
      expect(validateCreateTodo({ title: 123 }).errors).toHaveLength(1);
    });

    it("rejects a missing body", () => {
      expect(validateCreateTodo().errors).toHaveLength(1);
    });

    it("rejects titles longer than the limit", () => {
      const { errors } = validateCreateTodo({ title: "a".repeat(TITLE_MAX_LENGTH + 1) });
      expect(errors[0]).toMatch(/at most/);
    });
  });

  describe("validateUpdateTodo", () => {
    it("requires at least one field", () => {
      expect(validateUpdateTodo({}).errors).toHaveLength(1);
      expect(validateUpdateTodo().errors).toHaveLength(1);
    });

    it("accepts title and completed", () => {
      expect(validateUpdateTodo({ title: "New", completed: true })).toEqual({
        errors: [],
        value: { title: "New", completed: true },
      });
    });

    it("rejects an empty title", () => {
      expect(validateUpdateTodo({ title: "   " }).errors).toHaveLength(1);
    });

    it("rejects a non-boolean completed", () => {
      expect(validateUpdateTodo({ completed: "true" }).errors).toEqual([
        "completed must be a boolean",
      ]);
    });
  });
});
