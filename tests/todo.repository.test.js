const { createTodoRepository } = require("../src/repositories/todo.repository");

describe("todo.repository", () => {
  let db;
  let repo;

  beforeEach(() => {
    db = { query: jest.fn() };
    repo = createTodoRepository(db);
  });

  it("findAll returns all rows", async () => {
    db.query.mockResolvedValue({ rows: [{ id: 1 }, { id: 2 }] });

    await expect(repo.findAll()).resolves.toEqual([{ id: 1 }, { id: 2 }]);
    expect(db.query.mock.calls[0][0]).toMatch(/ORDER BY id ASC/);
  });

  it("findById uses a parameterized query", async () => {
    db.query.mockResolvedValue({ rows: [{ id: 7 }] });

    await expect(repo.findById(7)).resolves.toEqual({ id: 7 });
    expect(db.query).toHaveBeenCalledWith(expect.stringMatching(/WHERE id = \$1/), [7]);
  });

  it("findById returns null when missing", async () => {
    db.query.mockResolvedValue({ rows: [] });

    await expect(repo.findById(7)).resolves.toBeNull();
  });

  it("create inserts the title", async () => {
    db.query.mockResolvedValue({ rows: [{ id: 1, title: "x" }] });

    await expect(repo.create({ title: "x" })).resolves.toEqual({ id: 1, title: "x" });
    expect(db.query).toHaveBeenCalledWith(expect.stringMatching(/INSERT INTO todos/), ["x"]);
  });

  it("update passes null for omitted fields", async () => {
    db.query.mockResolvedValue({ rows: [{ id: 3, completed: true }] });

    await expect(repo.update(3, { completed: true })).resolves.toEqual({
      id: 3,
      completed: true,
    });
    expect(db.query.mock.calls[0][1]).toEqual([null, true, 3]);
  });

  it("update returns null when missing", async () => {
    db.query.mockResolvedValue({ rows: [] });

    await expect(repo.update(3, { title: "x" })).resolves.toBeNull();
  });

  it.each([
    [1, true],
    [0, false],
  ])("remove with rowCount %i returns %s", async (rowCount, expected) => {
    db.query.mockResolvedValue({ rowCount });

    await expect(repo.remove(5)).resolves.toBe(expected);
  });
});
