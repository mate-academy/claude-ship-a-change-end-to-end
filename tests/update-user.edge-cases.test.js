// Extra coverage for PUT /users/:id beyond the grading tests in
// tests/update-user.test.js. That file is fixed and shouldn't be touched, so
// these cases (id shape, email shape, whitespace, non-string fields, and
// whether the update actually persists) live here instead.

const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const app = require("../server");

test("PUT /users/:id with a non-numeric id returns 404, not a crash", async () => {
  const res = await request(app)
    .put("/users/abc")
    .send({ name: "Someone", email: "someone@example.com" });

  assert.strictEqual(res.status, 404);
});

test("PUT /users/:id with a malformed email returns 400", async () => {
  const res = await request(app)
    .put("/users/1")
    .send({ name: "Someone", email: "not-an-email" });

  assert.strictEqual(res.status, 400);
});

test("PUT /users/:id with an empty body returns 400", async () => {
  const res = await request(app).put("/users/1").send({});

  assert.strictEqual(res.status, 400);
});

test("PUT /users/:id with a whitespace-only name returns 400", async () => {
  const res = await request(app)
    .put("/users/1")
    .send({ name: "   ", email: "someone@example.com" });

  assert.strictEqual(res.status, 400);
});

test("PUT /users/:id with a non-string field returns 400", async () => {
  const res = await request(app)
    .put("/users/1")
    .send({ name: 42, email: "someone@example.com" });

  assert.strictEqual(res.status, 400);
});

test("PUT /users/:id persists the update", async () => {
  const created = await request(app)
    .post("/users")
    .send({ name: "Original Name", email: "original@example.com" });

  await request(app)
    .put(`/users/${created.body.id}`)
    .send({ name: "Updated Name", email: "updated@example.com" });

  const res = await request(app).get(`/users/${created.body.id}`);

  assert.strictEqual(res.body.name, "Updated Name");
  assert.strictEqual(res.body.email, "updated@example.com");
});

test("PUT /users/:id does not change the user's id", async () => {
  const created = await request(app)
    .post("/users")
    .send({ name: "Original Name", email: "original@example.com" });

  const res = await request(app)
    .put(`/users/${created.body.id}`)
    .send({ name: "Updated Name", email: "updated@example.com" });

  assert.strictEqual(res.body.id, created.body.id);
});
