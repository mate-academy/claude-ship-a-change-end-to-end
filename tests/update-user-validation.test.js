// Edge cases for PUT /users/:id beyond the provided grading tests.

const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const app = require("../server");

async function createUser() {
  const res = await request(app)
    .post("/users")
    .send({ name: "Edge Case", email: "edge@example.com" });
  return res.body;
}

test("PUT /users/:id persists the update", async () => {
  const user = await createUser();

  await request(app)
    .put(`/users/${user.id}`)
    .send({ name: "  Edited  ", email: "edited@example.com" });

  const res = await request(app).get(`/users/${user.id}`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.id, user.id);
  assert.strictEqual(res.body.name, "Edited");
  assert.strictEqual(res.body.email, "edited@example.com");
});

test("PUT /users/:id with an empty body returns 400", async () => {
  const res = await request(app).put("/users/1").send({});
  assert.strictEqual(res.status, 400);
  assert.ok(res.body.error);
});

test("PUT /users/:id with a blank name returns 400", async () => {
  const res = await request(app)
    .put("/users/1")
    .send({ name: "   ", email: "a@example.com" });
  assert.strictEqual(res.status, 400);
});

test("PUT /users/:id with a non-string field returns 400", async () => {
  const res = await request(app)
    .put("/users/1")
    .send({ name: 42, email: "a@example.com" });
  assert.strictEqual(res.status, 400);
});

test("PUT /users/:id with an invalid email returns 400", async () => {
  const res = await request(app)
    .put("/users/1")
    .send({ name: "Ada", email: "not-an-email" });
  assert.strictEqual(res.status, 400);
  assert.match(res.body.error, /email/);
});

test("PUT /users/:id with a non-numeric id returns 404", async () => {
  const res = await request(app)
    .put("/users/abc")
    .send({ name: "Nobody", email: "nobody@example.com" });
  assert.strictEqual(res.status, 404);
});

test("invalid input does not modify the user", async () => {
  const user = await createUser();

  await request(app)
    .put(`/users/${user.id}`)
    .send({ name: "Changed", email: "bad" });

  const res = await request(app).get(`/users/${user.id}`);
  assert.strictEqual(res.body.name, user.name);
  assert.strictEqual(res.body.email, user.email);
});
