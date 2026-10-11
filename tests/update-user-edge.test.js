// Edge cases for PUT /users/:id beyond the provided grading tests.

const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const app = require("../server");

test("PUT /users/:id rejects an empty body with 400", async () => {
  const res = await request(app).put("/users/1").send({});

  assert.strictEqual(res.status, 400);
  assert.ok(res.body.error);
});

test("PUT /users/:id rejects non-string and blank values with 400", async () => {
  const bodies = [
    { name: 123, email: "a@example.com" },
    { name: "A", email: ["a@example.com"] },
    { name: "   ", email: "a@example.com" },
    { name: "A", email: "" },
  ];

  for (const body of bodies) {
    const res = await request(app).put("/users/1").send(body);
    assert.strictEqual(res.status, 400, JSON.stringify(body));
  }
});

test("PUT /users/:id returns 404 for a non-numeric id", async () => {
  const res = await request(app)
    .put("/users/abc")
    .send({ name: "A", email: "a@example.com" });

  assert.strictEqual(res.status, 404);
});

test("PUT /users/:id trims surrounding whitespace before saving", async () => {
  const created = await request(app)
    .post("/users")
    .send({ name: "Edsger Dijkstra", email: "edsger@example.com" });

  const res = await request(app)
    .put(`/users/${created.body.id}`)
    .send({ name: "  Edsger W. Dijkstra  ", email: " ewd@example.com " });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.name, "Edsger W. Dijkstra");
  assert.strictEqual(res.body.email, "ewd@example.com");
});
