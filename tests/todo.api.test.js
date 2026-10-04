const request = require("supertest");

const { buildApp } = require("./helpers/build-app");
const { createInMemoryTodoRepository } = require("./helpers/in-memory-todo.repository");

describe("Todo API", () => {
  let app;

  beforeEach(() => {
    app = buildApp({
      todoRepository: createInMemoryTodoRepository([
        { id: 1, title: "Learn Docker", completed: false, created_at: "2026-01-01" },
      ]),
    });
  });

  describe("GET /api/todos", () => {
    it("returns all todos", async () => {
      const res = await request(app).get("/api/todos");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe("Learn Docker");
    });
  });

  describe("GET /api/todos/:id", () => {
    it("returns a todo by id", async () => {
      const res = await request(app).get("/api/todos/1");

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
    });

    it("returns 404 when the todo does not exist", async () => {
      const res = await request(app).get("/api/todos/999");

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Todo not found");
    });

    it("returns 400 for an invalid id", async () => {
      const res = await request(app).get("/api/todos/abc");

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/todos", () => {
    it("creates a todo", async () => {
      const res = await request(app)
        .post("/api/todos")
        .send({ title: "  Setup CI  " });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ id: 2, title: "Setup CI", completed: false });
    });

    it("rejects a missing title", async () => {
      const res = await request(app).post("/api/todos").send({});

      expect(res.status).toBe(400);
      expect(res.body.errors).toContain("title must be a non-empty string");
    });

    it("rejects malformed JSON", async () => {
      const res = await request(app)
        .post("/api/todos")
        .set("Content-Type", "application/json")
        .send("{bad json");

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Malformed JSON body");
    });
  });

  describe("PUT /api/todos/:id", () => {
    it("updates a todo", async () => {
      const res = await request(app)
        .put("/api/todos/1")
        .send({ completed: true });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: 1, title: "Learn Docker", completed: true });
    });

    it("returns 404 when the todo does not exist", async () => {
      const res = await request(app).put("/api/todos/999").send({ title: "x" });

      expect(res.status).toBe(404);
    });

    it("returns 400 for an invalid id", async () => {
      const res = await request(app).put("/api/todos/0").send({ title: "x" });

      expect(res.status).toBe(400);
    });

    it("rejects an invalid body", async () => {
      const res = await request(app)
        .put("/api/todos/1")
        .send({ completed: "yes" });

      expect(res.status).toBe(400);
      expect(res.body.errors).toContain("completed must be a boolean");
    });
  });

  describe("DELETE /api/todos/:id", () => {
    it("deletes a todo", async () => {
      const res = await request(app).delete("/api/todos/1");
      expect(res.status).toBe(204);

      const after = await request(app).get("/api/todos/1");
      expect(after.status).toBe(404);
    });

    it("returns 404 when the todo does not exist", async () => {
      const res = await request(app).delete("/api/todos/999");

      expect(res.status).toBe(404);
    });

    it("returns 400 for an invalid id", async () => {
      const res = await request(app).delete("/api/todos/-1");

      expect(res.status).toBe(400);
    });
  });

  describe("error handling", () => {
    it("returns 404 for unknown routes", async () => {
      const res = await request(app).get("/does-not-exist");

      expect(res.status).toBe(404);
    });

    it("returns 500 and hides details when the repository fails", async () => {
      const failingApp = buildApp({
        todoRepository: {
          ...createInMemoryTodoRepository(),
          findAll: async () => {
            throw new Error("connection refused");
          },
        },
      });

      const res = await request(failingApp).get("/api/todos");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: "Internal server error" });
    });
  });
});
