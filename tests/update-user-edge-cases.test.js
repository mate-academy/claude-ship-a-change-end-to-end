// Edge cases for PUT /users/:id beyond the grading tests in update-user.test.js.

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

test("PUT /users/:id 404 comes from the route, not a missing route", async () => {
  const res = await request(app)
    .put("/users/9999")
    .send({ name: "Nobody", email: "nobody@example.com" });

  assert.strictEqual(res.status, 404);
  assert.deepStrictEqual(res.body, { error: "User not found" });
});

test("PUT /users/:id persists the update in the store", async () => {
  const user = await createUser();

  await request(app)
    .put(`/users/${user.id}`)
    .send({ name: "Updated", email: "updated@example.com" });

  const res = await request(app).get(`/users/${user.id}`);
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, {
    id: user.id,
    name: "Updated",
    email: "updated@example.com",
  });
});

test("PUT /users/:id trims name and email before storing", async () => {
  const user = await createUser();

  const res = await request(app)
    .put(`/users/${user.id}`)
    .send({ name: "  Padded  ", email: " padded@example.com " });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.name, "Padded");
  assert.strictEqual(res.body.email, "padded@example.com");
});

for (const [label, body] of [
  ["whitespace-only name", { name: "   ", email: "a@example.com" }],
  ["empty email", { name: "A", email: "" }],
  ["non-string name", { name: 5, email: "a@example.com" }],
  ["null email", { name: "A", email: null }],
]) {
  test(`PUT /users/:id rejects ${label} with 400`, async () => {
    const res = await request(app).put("/users/1").send(body);

    assert.strictEqual(res.status, 400);
    assert.match(res.body.error, /name and email/);
  });
}

for (const id of ["abc", "0x1", "1.0", "1e0", "0", "-1"]) {
  test(`PUT /users/${id} rejects the id with 400`, async () => {
    const res = await request(app)
      .put(`/users/${id}`)
      .send({ name: "A", email: "a@example.com" });

    assert.strictEqual(res.status, 400);
    assert.deepStrictEqual(res.body, { error: "id must be a positive integer" });
  });
}
