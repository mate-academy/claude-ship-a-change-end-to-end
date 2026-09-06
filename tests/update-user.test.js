// Grading tests for the "update a user" endpoint.
// Implement PUT /users/:id (and the store helper it needs) so these pass.
// Don't edit this file — turning it green is how the feature is checked.

const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const app = require("../server");

test("PUT /users/:id updates an existing user", async () => {
  const created = await request(app)
    .post("/users")
    .send({ name: "Grace Hopper", email: "grace@example.com" });

  const res = await request(app)
    .put(`/users/${created.body.id}`)
    .send({ name: "Grace M. Hopper", email: "grace.hopper@example.com" });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.name, "Grace M. Hopper");
  assert.strictEqual(res.body.email, "grace.hopper@example.com");
});

test("PUT /users/:id returns 404 for a user that does not exist", async () => {
  const res = await request(app)
    .put("/users/9999")
    .send({ name: "Nobody", email: "nobody@example.com" });

  assert.strictEqual(res.status, 404);
});

test("PUT /users/:id with a missing field returns 400", async () => {
  const res = await request(app).put("/users/1").send({ name: "Only a name" });

  assert.strictEqual(res.status, 400);
});
