// Edge-case tests for PUT /users/:id, beyond the provided grading tests.
// Each test creates its own user so it doesn't depend on the seed data.

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

test("PUT /users/:id ignores an id sent in the body", async () => {
  const user = await createUser();

  const res = await request(app)
    .put(`/users/${user.id}`)
    .send({ id: 99999, name: "Still Me", email: "still.me@example.com" });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.id, user.id);
});

test("PUT /users/:id rejects a non-string name with 400", async () => {
  const user = await createUser();

  const res = await request(app)
    .put(`/users/${user.id}`)
    .send({ name: 123, email: "num@example.com" });

  assert.strictEqual(res.status, 400);
});

test("PUT /users/:id rejects a null field with 400", async () => {
  const user = await createUser();

  const res = await request(app)
    .put(`/users/${user.id}`)
    .send({ name: "Null Email", email: null });

  assert.strictEqual(res.status, 400);
});

test("PUT /users/:id rejects an array field with 400", async () => {
  const user = await createUser();

  const res = await request(app)
    .put(`/users/${user.id}`)
    .send({ name: "Array Email", email: ["a@example.com"] });

  assert.strictEqual(res.status, 400);
});

test("PUT /users/:id rejects a whitespace-only field with 400", async () => {
  const user = await createUser();

  const res = await request(app)
    .put(`/users/${user.id}`)
    .send({ name: "   ", email: "blank@example.com" });

  assert.strictEqual(res.status, 400);
});

test("PUT /users/:id with an empty body returns 400", async () => {
  const user = await createUser();

  const res = await request(app).put(`/users/${user.id}`).send({});

  assert.strictEqual(res.status, 400);
});

test("PUT /users/:id returns 404 for a non-numeric id", async () => {
  const res = await request(app)
    .put("/users/abc")
    .send({ name: "Nobody", email: "nobody@example.com" });

  assert.strictEqual(res.status, 404);
});

test("PUT /users/:id returns 404 for a fractional or negative id", async () => {
  const fractional = await request(app)
    .put("/users/1.5")
    .send({ name: "Nobody", email: "nobody@example.com" });
  const negative = await request(app)
    .put("/users/-1")
    .send({ name: "Nobody", email: "nobody@example.com" });

  assert.strictEqual(fractional.status, 404);
  assert.strictEqual(negative.status, 404);
});

test("PUT /users/:id checks the body before the id, so an unknown id with a bad body returns 400", async () => {
  const res = await request(app).put("/users/9999").send({ name: "Only a name" });

  assert.strictEqual(res.status, 400);
});

test("PUT /users/:id saves the new values for later reads", async () => {
  const user = await createUser();

  await request(app)
    .put(`/users/${user.id}`)
    .send({ name: "Saved Name", email: "saved@example.com" });
  const res = await request(app).get(`/users/${user.id}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.name, "Saved Name");
  assert.strictEqual(res.body.email, "saved@example.com");
});
