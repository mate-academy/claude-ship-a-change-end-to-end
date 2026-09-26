// Edge-case tests for name/email validation, shared by POST and PUT /users.

const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const app = require("../server");

const invalidBodies = {
  "non-string name": { name: 123, email: "a@example.com" },
  "non-string email": { name: "A", email: ["a@example.com"] },
  "object name": { name: { first: "A" }, email: "a@example.com" },
  "whitespace-only name": { name: "   ", email: "a@example.com" },
  "whitespace-only email": { name: "A", email: "   " },
  "empty strings": { name: "", email: "" },
};

for (const [label, body] of Object.entries(invalidBodies)) {
  test(`POST /users rejects ${label}`, async () => {
    const res = await request(app).post("/users").send(body);
    assert.strictEqual(res.status, 400);
  });

  test(`PUT /users/:id rejects ${label} and leaves the user unchanged`, async () => {
    const before = await request(app).get("/users/2");
    const res = await request(app).put("/users/2").send(body);
    const after = await request(app).get("/users/2");

    assert.strictEqual(res.status, 400);
    assert.deepStrictEqual(after.body, before.body);
  });
}

test("PUT /users/:id without a body returns 400", async () => {
  const res = await request(app).put("/users/2");
  assert.strictEqual(res.status, 400);
});

test("POST /users trims name and email", async () => {
  const res = await request(app)
    .post("/users")
    .send({ name: "  Edsger Dijkstra ", email: " edsger@example.com  " });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.name, "Edsger Dijkstra");
  assert.strictEqual(res.body.email, "edsger@example.com");
});

test("PUT /users/:id trims name and email", async () => {
  const created = await request(app)
    .post("/users")
    .send({ name: "Barbara Liskov", email: "barbara@example.com" });

  const res = await request(app)
    .put(`/users/${created.body.id}`)
    .send({ name: "  Barbara J. Liskov ", email: " liskov@example.com " });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.name, "Barbara J. Liskov");
  assert.strictEqual(res.body.email, "liskov@example.com");
});

test("PUT /users/:id ignores an id in the body", async () => {
  const created = await request(app)
    .post("/users")
    .send({ name: "Linus", email: "linus@example.com" });

  const res = await request(app)
    .put(`/users/${created.body.id}`)
    .send({ id: 1, name: "Linus T", email: "linus@example.com" });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.id, created.body.id);
});

test("PUT /users/:id with an invalid body and unknown id returns 400", async () => {
  const res = await request(app).put("/users/9999").send({ name: "Only a name" });
  assert.strictEqual(res.status, 400);
});

test("PUT /users/:id with a non-numeric id returns 404", async () => {
  const res = await request(app)
    .put("/users/abc")
    .send({ name: "A", email: "a@example.com" });

  assert.strictEqual(res.status, 404);
});
