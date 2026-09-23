// Additional edge-case tests for PUT /users/:id, written during self-review.
// Complements tests/update-user.test.js (which is not edited).

const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const app = require("../server");

test("PUT /users/:id with an invalid email returns 400", async () => {
  const res = await request(app)
    .put("/users/1")
    .send({ name: "Ada", email: "not-an-email" });

  assert.strictEqual(res.status, 400);
  assert.match(res.body.error, /email/i);
});

test("PUT /users/:id with an empty name returns 400", async () => {
  const res = await request(app)
    .put("/users/1")
    .send({ name: "   ", email: "ada@example.com" });

  assert.strictEqual(res.status, 400);
});

test("PUT /users/:id with a non-string field returns 400", async () => {
  const res = await request(app)
    .put("/users/1")
    .send({ name: 123, email: "ada@example.com" });

  assert.strictEqual(res.status, 400);
});

test("PUT /users/:id with malformed JSON returns 400 with a JSON error body", async () => {
  const res = await request(app)
    .put("/users/1")
    .set("Content-Type", "application/json")
    .send("{not valid json");

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.type, "application/json");
  assert.ok(res.body.error);
});

test("PUT /users/:id with a non-numeric id returns 404, not a crash", async () => {
  const res = await request(app)
    .put("/users/0x2")
    .send({ name: "Ada", email: "ada@example.com" });

  assert.strictEqual(res.status, 404);
});

test("PUT /users/:id with a decimal id returns 404", async () => {
  const res = await request(app)
    .put("/users/1.0")
    .send({ name: "Ada", email: "ada@example.com" });

  assert.strictEqual(res.status, 404);
});

test("PUT /users/:id ignores an id field in the body", async () => {
  const created = await request(app)
    .post("/users")
    .send({ name: "Edge Case", email: "edge@example.com" });

  const res = await request(app)
    .put(`/users/${created.body.id}`)
    .send({ id: 99999, name: "Renamed", email: "renamed@example.com" });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.id, created.body.id);
});
